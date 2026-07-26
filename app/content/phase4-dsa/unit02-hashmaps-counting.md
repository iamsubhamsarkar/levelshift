---
unit: p4u2
title: HashMaps & Counting Patterns
teaches: [dsa.frequency_counting, dsa.two_sum_hashmap, dsa.anagram_detection]
requires: [collections.hashmap, basics.strings, collections.arraylist]
---

## HOOK
question: You're given a list of 1 million product IDs from a log. Find the ONE duplicate. You can't sort it (too slow). You can't compare every pair (1 trillion comparisons). What data structure lets you answer in ONE pass?
```java
// Hint: What if you had a "have I seen this before?" lookup that's O(1)?
String[] ids = {"A101", "B202", "C303", "A101", "D404"};
// Answer: HashMap! Check existence before inserting.
// One pass = O(n). One million lookups instead of one trillion comparisons.
```

## FAIL_FIRST
prompt: Given an array, find TWO indices whose values add up to a target. Return the indices. (This is LeetCode #1 — the most asked interview question globally.)
```java
import java.util.HashMap;

public class TwoSum {
    public static int[] twoSum(int[] nums, int target) {
        HashMap<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            // TODO: Check if complement exists in 'seen'
            // TODO: If yes, return the two indices
            // TODO: Otherwise, store nums[i] -> i in 'seen'
        }
        return new int[]{-1, -1};
    }

    public static void main(String[] args) {
        int[] nums = {2, 7, 11, 15};
        int[] result = twoSum(nums, 9);
        System.out.println(result[0] + ", " + result[1]);
        // Expected: 0, 1  (because nums[0] + nums[1] = 2 + 7 = 9)
    }
}
```
hint: For each number, the "complement" is target - nums[i]. If the complement is already in the map, you've found your pair.
expected: 0, 1

## ANALOGY
A HashMap is like a coat check at a theater. You hand over your coat (value) and get a numbered ticket (key). When you want your coat back, you don't search through 500 coats — you just hand over the ticket, and they go DIRECTLY to your coat. That's O(1) lookup. Frequency counting is like a tally counter at a door — every time someone enters, you mark +1 for that person's name. At the end, you instantly know who came the most.

## CODE
```java
import java.util.*;

// Pattern 1: Two Sum with HashMap — O(n) time, O(n) space
public static int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> seen = new HashMap<>();
    for (int i = 0; i < nums.length; i++) {
        int complement = target - nums[i];
        if (seen.containsKey(complement)) {
            return new int[]{seen.get(complement), i};
        }
        seen.put(nums[i], i);
    }
    return new int[]{-1, -1};
}

// Pattern 2: Frequency counting
public static char mostFrequentChar(String s) {
    Map<Character, Integer> freq = new HashMap<>();
    for (char c : s.toCharArray()) {
        freq.put(c, freq.getOrDefault(c, 0) + 1);
    }
    char result = ' ';
    int maxCount = 0;
    for (Map.Entry<Character, Integer> entry : freq.entrySet()) {
        if (entry.getValue() > maxCount) {
            maxCount = entry.getValue();
            result = entry.getKey();
        }
    }
    return result;
}

// Pattern 3: Anagram detection (same frequency signature)
public static boolean isAnagram(String s, String t) {
    if (s.length() != t.length()) return false;
    Map<Character, Integer> freq = new HashMap<>();
    for (char c : s.toCharArray()) {
        freq.put(c, freq.getOrDefault(c, 0) + 1);
    }
    for (char c : t.toCharArray()) {
        freq.put(c, freq.getOrDefault(c, 0) - 1);
        if (freq.get(c) < 0) return false;
    }
    return true;
}

// Pattern 4: Group anagrams together
public static List<List<String>> groupAnagrams(String[] strs) {
    Map<String, List<String>> groups = new HashMap<>();
    for (String s : strs) {
        char[] chars = s.toCharArray();
        Arrays.sort(chars);
        String key = new String(chars);
        groups.computeIfAbsent(key, k -> new ArrayList<>()).add(s);
    }
    return new ArrayList<>(groups.values());
}
```
highlight: [6, 7, 8, 9]
annotation: The Two Sum pattern stores "what we've seen so far" in a HashMap. For each element, we compute complement = target - nums[i] and call containsKey — turning an O(n²) nested loop into O(n). getOrDefault avoids null checks when counting. computeIfAbsent is the cleanest way to group items into lists by a shared key.

## BREAK_IT
setup:
```java
public static int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> seen = new HashMap<>();
    for (int i = 0; i < nums.length; i++) {
        int complement = target - nums[i];
        if (seen.containsKey(complement)) {
            return new int[]{seen.get(complement), i};
        }
        seen.put(nums[i], i);
    }
    return new int[]{-1, -1};
}
// nums = {3, 3}, target = 6
```
modification: What if we put ALL values in the map FIRST, then check complements in a second pass?
question: With nums = {3, 3} and target = 6, what goes wrong with a two-pass approach?
options: [It returns {1, 1} — same index twice, It still works correctly, It throws NullPointerException]
correct: 0
explanation: If we call seen.put(nums[i], i) for all elements first, the key 3 maps to index 1 because the second put overwrites the first. Then when we compute complement = target - nums[1] = 3 and call seen.get(3), we get index 1 — the same element. The one-pass approach calls containsKey BEFORE seen.put, so we never match an element with itself.

## CONTRAST
label: Finding Two Sum
codeA:
```java
// Brute force: O(n²) time, O(1) space
public static int[] twoSumBrute(int[] nums, int target) {
    for (int i = 0; i < nums.length; i++) {
        for (int j = i + 1; j < nums.length; j++) {
            if (nums[i] + nums[j] == target) {
                return new int[]{i, j};
            }
        }
    }
    return new int[]{-1, -1};
}
```
codeB:
```java
// HashMap: O(n) time, O(n) space
public static int[] twoSumMap(int[] nums, int target) {
    Map<Integer, Integer> seen = new HashMap<>();
    for (int i = 0; i < nums.length; i++) {
        int complement = target - nums[i];
        if (seen.containsKey(complement)) {
            return new int[]{seen.get(complement), i};
        }
        seen.put(nums[i], i);
    }
    return new int[]{-1, -1};
}
```
question: What's the trade-off between brute force and HashMap approach?
options: [HashMap trades O(n) space for O(n) time, HashMap is always better, Brute force is more readable so prefer it, They have the same complexity]
correct: 0
explanation: The HashMap approach stores each nums[i] with seen.put, using O(n) extra memory so that containsKey gives O(1) lookups — achieving O(n) time. Brute force uses no extra space but nests two for-loops over i and j for O(n²) time. In interviews the HashMap solution is expected — always mention this space-time trade-off.

## EXPLAIN_BACK
mode: pick_best
prompt: How does the HashMap Two Sum achieve O(n) time?
options: [For each element it computes complement and calls containsKey on the seen map in O(1), It sorts the array first then uses binary search, It uses two nested for-loops but exits early, It stores all elements in an ArrayList and calls contains]
correct: 0

## CONNECT
text: HashMap counting is everywhere in test automation:
```java
// Counting API response codes across test runs
Map<Integer, Integer> statusCounts = new HashMap<>();
for (Response r : testResults) {
    int code = r.getStatusCode();
    statusCounts.put(code, statusCounts.getOrDefault(code, 0) + 1);
}
// Assert: no 5xx errors in any test
for (Map.Entry<Integer, Integer> entry : statusCounts.entrySet()) {
    if (entry.getKey() >= 500) {
        fail("Got " + entry.getValue() + " server errors with status " + entry.getKey());
    }
}
```
note: The frequency counting pattern you just learned is the foundation for data validation in test frameworks. Grouping by key (groupAnagrams pattern) maps directly to grouping test results by category, status, or tag.
