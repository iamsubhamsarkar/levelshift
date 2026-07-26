---
unit: p4u3
title: Sliding Window Technique
teaches: [dsa.fixed_window, dsa.variable_window, dsa.max_sum_subarray]
requires: [dsa.array_traversal, collections.hashmap, basics.types]
---

## HOOK
question: A sensor reports temperature every second. Find the hottest 5-second window in a million readings. Brute force sums every possible window of 5 — that's ~5 million additions. But what if each new window only differs from the previous by ONE element entering and ONE leaving?
```java
// Readings: [3, 1, 4, 1, 5, 9, 2, 6, 5, 3]
// Window size: 3
// Window 1: 3+1+4 = 8
// Window 2: (8 - 3) + 1 = 6  ← subtract the one that left, add the one that entered!
// Window 3: (6 - 1) + 5 = 10
// Only 2 operations per window instead of k. That's O(n) total!
```

## FAIL_FIRST
prompt: Find the maximum sum of any subarray of size k. Complete the sliding window logic.
```java
public class MaxSumWindow {
    public static int maxSumSubarray(int[] arr, int k) {
        // Step 1: Sum the first window
        int windowSum = 0;
        for (int i = 0; i < k; i++) {
            windowSum += arr[i];
        }
        int maxSum = windowSum;

        // Step 2: Slide the window
        for (int i = k; i < arr.length; i++) {
            // TODO: Add the new element entering the window
            // TODO: Subtract the element leaving the window
            // TODO: Update maxSum if windowSum is larger
        }
        return maxSum;
    }

    public static void main(String[] args) {
        int[] arr = {2, 1, 5, 1, 3, 2};
        System.out.println(maxSumSubarray(arr, 3));
        // Expected: 9 (subarray [5, 1, 3])
    }
}
```
hint: The element leaving is at index i - k. The element entering is at index i.
expected: 9

## ANALOGY
Imagine reading a book through a magnifying glass that shows exactly 3 lines at a time. To read line 4, you don't re-read lines 2 and 3 — you just shift the glass down one line. The OLD line 1 disappears from view, the NEW line 4 appears. That "shift" is the sliding window. Fixed window = magnifying glass always shows exactly k items. Variable window = a rubber band that stretches and shrinks based on a condition (like "keep expanding until the sum exceeds a limit, then shrink from the left").

## CODE
```java
import java.util.*;

// Pattern 1: Fixed-size window — Maximum sum of subarray of size k
public static int maxSumFixed(int[] arr, int k) {
    int windowSum = 0;
    for (int i = 0; i < k; i++) windowSum += arr[i];
    int maxSum = windowSum;
    for (int i = k; i < arr.length; i++) {
        windowSum += arr[i] - arr[i - k];  // add new, remove old
        maxSum = Math.max(maxSum, windowSum);
    }
    return maxSum;
}

// Pattern 2: Variable-size window — Longest substring without repeating chars
public static int longestUniqueSubstring(String s) {
    Map<Character, Integer> lastSeen = new HashMap<>();
    int maxLen = 0;
    int left = 0;

    for (int right = 0; right < s.length(); right++) {
        char c = s.charAt(right);
        if (lastSeen.containsKey(c) && lastSeen.get(c) >= left) {
            left = lastSeen.get(c) + 1;  // shrink window past duplicate
        }
        lastSeen.put(c, right);
        maxLen = Math.max(maxLen, right - left + 1);
    }
    return maxLen;
}

// Pattern 3: Variable window — Smallest subarray with sum >= target
public static int minSubarrayLen(int target, int[] nums) {
    int left = 0, sum = 0;
    int minLen = Integer.MAX_VALUE;

    for (int right = 0; right < nums.length; right++) {
        sum += nums[right];
        while (sum >= target) {
            minLen = Math.min(minLen, right - left + 1);
            sum -= nums[left];
            left++;
        }
    }
    return minLen == Integer.MAX_VALUE ? 0 : minLen;
}
```
highlight: [8, 22, 23]
annotation: Fixed window uses windowSum += arr[i] - arr[i - k] — one add, one subtract per slide. Variable window uses left and right pointers where right always advances and left catches up when a condition is violated. For "longest substring without repeats," when lastSeen.containsKey(c) finds a duplicate, we jump left past the previous occurrence. Time O(n) because each element is added and removed at most once.

## BREAK_IT
setup:
```java
public static int longestUniqueSubstring(String s) {
    Map<Character, Integer> lastSeen = new HashMap<>();
    int maxLen = 0, left = 0;
    for (int right = 0; right < s.length(); right++) {
        char c = s.charAt(right);
        if (lastSeen.containsKey(c) && lastSeen.get(c) >= left) {
            left = lastSeen.get(c) + 1;
        }
        lastSeen.put(c, right);
        maxLen = Math.max(maxLen, right - left + 1);
    }
    return maxLen;
}
// Input: "abba"
```
modification: What if we remove the `&& lastSeen.get(c) >= left` check?
question: What does longestUniqueSubstring("abba") return without that condition?
options: [2, 3, 4]
correct: 1
explanation: Without the >= left check, when right reaches the second 'a' at index 3, lastSeen.get('a') returns 0, so left is set to 1. But left was already at 2 (moved there when the second 'b' triggered lastSeen.get('b') = 1, setting left = 2). Moving left BACKWARD from 2 to 1 breaks the window — it now includes the duplicate 'b'. The condition lastSeen.get(c) >= left ensures we only advance left forward, never backward.

## CONTRAST
label: Maximum sum subarray of size k
codeA:
```java
// Brute force: O(n*k) — recompute entire sum for each window
public static int maxSumBrute(int[] arr, int k) {
    int maxSum = Integer.MIN_VALUE;
    for (int i = 0; i <= arr.length - k; i++) {
        int sum = 0;
        for (int j = i; j < i + k; j++) {
            sum += arr[j];
        }
        maxSum = Math.max(maxSum, sum);
    }
    return maxSum;
}
```
codeB:
```java
// Sliding window: O(n) — reuse previous sum
public static int maxSumSlide(int[] arr, int k) {
    int windowSum = 0;
    for (int i = 0; i < k; i++) windowSum += arr[i];
    int maxSum = windowSum;
    for (int i = k; i < arr.length; i++) {
        windowSum += arr[i] - arr[i - k];
        maxSum = Math.max(maxSum, windowSum);
    }
    return maxSum;
}
```
question: Why is sliding window O(n) while brute force is O(n*k)?
options: [Each element is added and subtracted exactly once via windowSum += arr[i] - arr[i - k], The window never looks back, It uses less memory, The Math.max call is faster]
correct: 0
explanation: Brute force recomputes windowSum from scratch for each position — k additions per window via the inner for-loop over j. Sliding window reuses the previous windowSum by executing windowSum += arr[i] - arr[i - k] — one addition and one subtraction per slide regardless of k. Total work is n elements × 2 operations = O(n).

## EXPLAIN_BACK
mode: fill_blank
prompt: How does a variable-size window find the longest substring without repeating characters?
sentence: The right pointer always advances; when _____ finds a duplicate, we set left to _____ so the window only shrinks _____.
blanks: [lastSeen.containsKey(c), lastSeen.get(c) + 1, forward]
distractors: [freq.get(c), right - 1, backward]

## CONNECT
text: Sliding window is directly applicable to test metrics and monitoring:
```java
// Performance test: check no 5-second window exceeds threshold
int[] responseTimes = getResponseTimesMs();
int windowSize = 5;
int windowSum = 0;
for (int i = 0; i < windowSize; i++) windowSum += responseTimes[i];

for (int i = windowSize; i < responseTimes.length; i++) {
    windowSum += responseTimes[i] - responseTimes[i - windowSize];
    double avg = windowSum / (double) windowSize;
    assertTrue("5-sec avg exceeded 200ms at index " + i, avg <= 200);
}
```
note: Sliding window appears in Amazon SDET interviews both as a coding problem AND as a concept in performance testing — "detect latency spikes over a rolling time window." Knowing the pattern helps you in both contexts.
