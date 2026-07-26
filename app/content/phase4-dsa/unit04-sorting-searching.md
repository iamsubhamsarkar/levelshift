---
unit: p4u4
title: Sorting & Searching
teaches: [dsa.custom_sorting, dsa.binary_search, dsa.comparator]
requires: [collections.arraylist, basics.types, dsa.array_traversal]
---

## HOOK
question: You have a phone book with 1 million names sorted alphabetically. To find "Subham," you don't start at page 1. You open the middle — too far? Go left half. Not far enough? Go right half. Each step eliminates HALF the remaining pages. How many steps to find any name?
```java
// 1,000,000 names
// Step 1: 500,000 remaining
// Step 2: 250,000 remaining
// ...
// Step 20: 1 remaining → FOUND!
// log₂(1,000,000) ≈ 20 steps. That's binary search.
```

## FAIL_FIRST
prompt: Implement binary search on a sorted array. Find the index of the target, or return -1.
```java
public class BinarySearch {
    public static int search(int[] arr, int target) {
        int left = 0;
        int right = arr.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2; // avoids overflow
            // TODO: If arr[mid] == target, return mid
            // TODO: If arr[mid] < target, search right half
            // TODO: If arr[mid] > target, search left half
        }
        return -1;
    }

    public static void main(String[] args) {
        int[] arr = {1, 3, 5, 7, 9, 11, 13};
        System.out.println(search(arr, 7));  // Expected: 3
        System.out.println(search(arr, 4));  // Expected: -1
    }
}
```
hint: If arr[mid] < target, the answer must be in the right half — set left = mid + 1.
expected: 3

## ANALOGY
Sorting is like organizing a messy bookshelf — once sorted, finding anything becomes trivial. Binary search is the "guess the number" game: I think of a number between 1-100, you guess 50, I say "higher." You just eliminated 50 possibilities in one guess. Custom Comparator is like telling a librarian "sort by page count, not title" — same books, different ordering rule.

## CODE
```java
import java.util.*;

// Pattern 1: Binary search — O(log n)
public static int binarySearch(int[] arr, int target) {
    int left = 0, right = arr.length - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) return mid;
        else if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}

// Pattern 2: Arrays.sort with custom Comparator
public static String[] sortByLength(String[] words) {
    Arrays.sort(words, (a, b) -> a.length() - b.length());
    return words;
}

// Pattern 3: Sort objects by multiple criteria
public static void sortEmployees(List<int[]> employees) {
    // Sort by salary descending, then name index ascending
    employees.sort((a, b) -> {
        if (a[1] != b[1]) return b[1] - a[1]; // salary descending
        return a[0] - b[0];                     // id ascending
    });
}

// Pattern 4: Collections.binarySearch on a sorted list
public static int findInList(List<Integer> sortedList, int target) {
    int index = Collections.binarySearch(sortedList, target);
    // Returns negative value if not found: -(insertion point) - 1
    return index >= 0 ? index : -1;
}

// Pattern 5: Binary search for "first true" / boundary finding
public static int firstGreaterOrEqual(int[] arr, int target) {
    int left = 0, right = arr.length;
    while (left < right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] >= target) right = mid;
        else left = mid + 1;
    }
    return left; // first index where arr[index] >= target
}
```
highlight: [6, 7, 8, 9, 10]
annotation: Binary search uses left + (right - left) / 2 instead of (left + right) / 2 to prevent integer overflow when left and right are large. The while condition is left <= right for exact match. Custom Comparator lambda (a, b) -> returns negative (a first), positive (b first), or zero (equal). Chain multiple criteria with if-else as shown in sortEmployees.

## BREAK_IT
setup:
```java
public static int binarySearch(int[] arr, int target) {
    int left = 0, right = arr.length - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) return mid;
        else if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}
// arr = {1, 3, 5, 7, 9}, target = 5
```
modification: What if we change `left = mid + 1` to `left = mid`?
question: What happens when searching for target = 9?
options: [Infinite loop, Returns wrong index, Still works correctly]
correct: 0
explanation: When left = 3 and right = 4, mid = left + (right - left) / 2 = 3. Since arr[3] = 7 < 9, we set left = mid = 3. Next iteration: same left, same right, same mid — the while loop never terminates. Setting left = mid + 1 ensures we skip the already-checked mid element, guaranteeing the search space shrinks every iteration.

## CONTRAST
label: Searching for a value in a collection
codeA:
```java
// Linear search: O(n) — works on unsorted data
public static int linearSearch(int[] arr, int target) {
    for (int i = 0; i < arr.length; i++) {
        if (arr[i] == target) return i;
    }
    return -1;
}
```
codeB:
```java
// Binary search: O(log n) — requires sorted data
public static int binarySearch(int[] arr, int target) {
    int left = 0, right = arr.length - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) return mid;
        else if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}
```
question: When would you choose linear search over binary search?
options: [When data is unsorted and you only search once, Binary search is always better, When the array is very small, When you need the last occurrence]
correct: 0
explanation: Binary search requires sorted data. If you search only once, sorting costs O(n log n) plus O(log n) for the search — worse than a single linear O(n) scan. Binary search wins when you sort once via Arrays.sort and then call binarySearch many times — the O(n log n) sort is amortized across many O(log n) lookups.

## EXPLAIN_BACK
mode: pick_best
prompt: Why does binarySearch use left + (right - left) / 2 instead of (left + right) / 2?
options: [To prevent integer overflow when left and right are large, It makes the code more readable, It produces a different mid value, It avoids negative numbers]
correct: 0

## CONNECT
text: Sorting and searching are constant in SDET work:
```java
// Sort test results by execution time to find slowest tests
List<TestResult> results = getTestResults();
results.sort((a, b) -> Long.compare(b.getDurationMs(), a.getDurationMs()));

// Binary search in sorted log timestamps to find an event window
List<Long> timestamps = getSortedLogTimestamps();
int idx = Collections.binarySearch(timestamps, targetTime);
int insertionPoint = idx >= 0 ? idx : -(idx + 1);
// All events after targetTime start at insertionPoint
```
note: Custom sorting is used to prioritize test execution (critical tests first), rank defects by severity, and organize test reports. Binary search on timestamps is essential for log analysis in debugging production issues.
