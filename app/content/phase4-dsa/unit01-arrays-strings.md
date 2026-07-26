---
unit: p4u1
title: Arrays & String Patterns
teaches: [dsa.array_traversal, dsa.two_pointer, dsa.string_manipulation]
requires: [basics.types, basics.strings, collections.arraylist]
---

## HOOK
question: You have a sorted array [1, 2, 3, 4, 6, 8, 9, 11]. Find TWO numbers that add up to 10 — but you can only walk two fingers inward from both ends. How many checks does it take?
```java
int[] arr = {1, 2, 3, 4, 6, 8, 9, 11};
// Target: 10
// Start: left=0(value 1), right=7(value 11)
// 1+11=12 > 10 → move right inward
// 1+9=10 → FOUND! Only 2 checks!
// Brute force would need up to 28 checks (every pair)
```

## FAIL_FIRST
prompt: Reverse an array in-place (no extra array). Fill in the swap logic.
```java
public class ReverseArray {
    public static void reverse(int[] arr) {
        int left = 0;
        int right = arr.length - 1;
        while (left < right) {
            // TODO: swap arr[left] and arr[right]
            // TODO: move pointers inward
        }
    }

    public static void main(String[] args) {
        int[] nums = {1, 2, 3, 4, 5};
        reverse(nums);
        System.out.println(java.util.Arrays.toString(nums));
        // Expected: [5, 4, 3, 2, 1]
    }
}
```
hint: Use a temp variable to swap. Move left++ and right--.
expected: [5, 4, 3, 2, 1]

## ANALOGY
Two-pointer is like two people searching a bookshelf from opposite ends. One starts at the left, one at the right. They walk toward each other, eliminating half the possibilities with each step. Instead of one person checking every single book (O(n²)), two people working inward solve it in O(n). The key insight: in a SORTED array, if the sum is too big, shrink from the right. Too small? Advance from the left.

## CODE
```java
// Pattern 1: Two-pointer on sorted array (Two Sum)
public static int[] twoSumSorted(int[] arr, int target) {
    int left = 0, right = arr.length - 1;
    while (left < right) {
        int sum = arr[left] + arr[right];
        if (sum == target) return new int[]{left, right};
        else if (sum < target) left++;
        else right--;
    }
    return new int[]{-1, -1};
}

// Pattern 2: In-place string reversal with StringBuilder
public static String reverseWords(String s) {
    StringBuilder sb = new StringBuilder();
    String[] words = s.trim().split("\\s+");
    for (int i = words.length - 1; i >= 0; i--) {
        sb.append(words[i]);
        if (i > 0) sb.append(" ");
    }
    return sb.toString();
}

// Pattern 3: Check if a string is a palindrome (two-pointer)
public static boolean isPalindrome(String s) {
    int left = 0, right = s.length() - 1;
    while (left < right) {
        if (s.charAt(left) != s.charAt(right)) return false;
        left++;
        right--;
    }
    return true;
}
```
highlight: [4, 5, 6, 7, 8]
annotation: The two-pointer pattern works on SORTED arrays. The decision — move left or right — depends on comparing current sum to target. Time O(n), Space O(1). StringBuilder is preferred over String concatenation in loops because Strings are immutable — each + creates a new object.

## BREAK_IT
setup:
```java
public static int[] twoSumSorted(int[] arr, int target) {
    int left = 0, right = arr.length - 1;
    while (left < right) {
        int sum = arr[left] + arr[right];
        if (sum == target) return new int[]{left, right};
        else if (sum < target) left++;
        else right--;
    }
    return new int[]{-1, -1};
}
// arr = {1, 3, 5, 7, 9}, target = 8
```
modification: What if we change `left < right` to `left <= right`?
question: What happens when target = 6 and arr = {1, 2, 3, 4, 5}?
options: [Returns {2, 2} — same element used twice, Still works correctly, ArrayIndexOutOfBoundsException]
correct: 0
explanation: With left <= right, when left and right both equal 2, the while loop still runs. We compute sum = arr[2] + arr[2] = 6 which equals target, so we return {2, 2}. But left and right point to the SAME index — we used one element twice. The strict < in `while (left < right)` guarantees left and right always reference TWO different positions in the array.

## CONTRAST
label: Finding a pair that sums to target
codeA:
```java
// Brute force: O(n²) time, O(1) space
public static int[] twoSumBrute(int[] arr, int target) {
    for (int i = 0; i < arr.length; i++) {
        for (int j = i + 1; j < arr.length; j++) {
            if (arr[i] + arr[j] == target)
                return new int[]{i, j};
        }
    }
    return new int[]{-1, -1};
}
```
codeB:
```java
// Two-pointer: O(n) time, O(1) space (sorted input)
public static int[] twoSumOptimal(int[] arr, int target) {
    int left = 0, right = arr.length - 1;
    while (left < right) {
        int sum = arr[left] + arr[right];
        if (sum == target) return new int[]{left, right};
        else if (sum < target) left++;
        else right--;
    }
    return new int[]{-1, -1};
}
```
question: Why is two-pointer O(n) while brute force is O(n²)?
options: [Each pointer moves at most n times total, Sorting makes it faster, Two loops are always slower, It uses less memory]
correct: 0
explanation: In two-pointer, left only increments and right only decrements. Combined they traverse the array once — at most n moves total. Brute force nests two for-loops checking every pair with indices i and j. Two-pointer requires the array to be SORTED; if unsorted, sorting first costs O(n log n) which is still better than O(n²).

## EXPLAIN_BACK
mode: fill_blank
prompt: When would you use two-pointer instead of nested loops for Two Sum?
sentence: Two-pointer works on _____ arrays, giving O(n) time and O(1) space because left only _____ and right only _____.
blanks: [sorted, increments, decrements]
distractors: [unsorted, resets, doubles]

## CONNECT
text: In SDET interviews, array/string problems are the most common first round. You'll see them in:
```java
// Validating API response arrays
List<String> responseItems = response.jsonPath().getList("items");
// Check for duplicates — use the two-pointer pattern on sorted data
Collections.sort(responseItems);
for (int i = 1; i < responseItems.size(); i++) {
    if (responseItems.get(i).equals(responseItems.get(i-1))) {
        System.out.println("Duplicate found: " + responseItems.get(i));
    }
}
```
note: Array traversal and two-pointer are foundational. Every subsequent DSA pattern builds on the ability to walk through data intelligently rather than brute-forcing every combination.
