---
unit: p4u6
title: Recursion & Backtracking
teaches: [dsa.recursion, dsa.backtracking, dsa.permutations]
requires: [basics.types, collections.arraylist, dsa.stack_brackets]
---

## HOOK
question: You're standing in a maze. At each fork, you pick a direction. Dead end? Walk back to the last fork and try a different path. You're doing backtracking! Now imagine writing that as code — how do you "walk back"? The answer: the call stack does it for you. When a recursive function returns, you're automatically back at the previous fork.
```java
// Maze: 3 forks, each with 2 choices
// Fork 1: Left → Dead end → BACKTRACK
// Fork 1: Right → Fork 2
// Fork 2: Left → Fork 3
// Fork 3: Left → Dead end → BACKTRACK
// Fork 3: Right → EXIT! 
// Total paths explored: 4. But the maze has 2³ = 8 possible paths.
// Backtracking prunes dead ends EARLY instead of trying all 8.
```

## FAIL_FIRST
prompt: Write a recursive function to calculate factorial. Handle the base case and recursive case.
```java
public class Factorial {
    public static int factorial(int n) {
        // TODO: Base case — what should factorial(0) return?
        // TODO: Recursive case — n * factorial(n-1)
        return 0; // placeholder
    }

    public static void main(String[] args) {
        System.out.println(factorial(5));  // Expected: 120
        System.out.println(factorial(0));  // Expected: 1
        System.out.println(factorial(1));  // Expected: 1
    }
}
```
hint: Base case: if n <= 1, return 1. Recursive case: return n * factorial(n - 1).
expected: 120

## ANALOGY
Recursion is like Russian nesting dolls (Matryoshka). You open the biggest doll and find a smaller one inside. You keep opening until you reach the tiniest doll (base case). Then you close them back up one by one (unwinding the call stack). Each doll contains the same structure — just smaller. Backtracking is like solving a Sudoku puzzle with a pencil and eraser. Try a number, if it leads to a contradiction, ERASE it (undo) and try the next number. The "erasing" is the backtracking step.

## CODE
```java
import java.util.*;

// Pattern 1: Simple recursion — Factorial
public static int factorial(int n) {
    if (n <= 1) return 1;          // Base case
    return n * factorial(n - 1);   // Recursive case
}

// Pattern 2: Fibonacci with memoization
public static int fibonacci(int n, Map<Integer, Integer> memo) {
    if (n <= 1) return n;
    if (memo.containsKey(n)) return memo.get(n);
    int result = fibonacci(n - 1, memo) + fibonacci(n - 2, memo);
    memo.put(n, result);
    return result;
}

// Pattern 3: Generate all permutations (backtracking)
public static List<List<Integer>> permute(int[] nums) {
    List<List<Integer>> result = new ArrayList<>();
    backtrack(nums, new ArrayList<>(), new boolean[nums.length], result);
    return result;
}

private static void backtrack(int[] nums, List<Integer> current,
                               boolean[] used, List<List<Integer>> result) {
    if (current.size() == nums.length) {
        result.add(new ArrayList<>(current));  // found a complete permutation
        return;
    }
    for (int i = 0; i < nums.length; i++) {
        if (used[i]) continue;         // skip already-used elements
        current.add(nums[i]);          // CHOOSE
        used[i] = true;
        backtrack(nums, current, used, result);  // EXPLORE
        current.remove(current.size() - 1);      // UN-CHOOSE (backtrack)
        used[i] = false;
    }
}

// Pattern 4: Subsets (power set)
public static List<List<Integer>> subsets(int[] nums) {
    List<List<Integer>> result = new ArrayList<>();
    generateSubsets(nums, 0, new ArrayList<>(), result);
    return result;
}

private static void generateSubsets(int[] nums, int start,
                                     List<Integer> current, List<List<Integer>> result) {
    result.add(new ArrayList<>(current));  // every state is a valid subset
    for (int i = start; i < nums.length; i++) {
        current.add(nums[i]);
        generateSubsets(nums, i + 1, current, result);
        current.remove(current.size() - 1);  // backtrack
    }
}
```
highlight: [31, 32, 33, 34]
annotation: The backtracking template is CHOOSE → EXPLORE → UN-CHOOSE. current.add(nums[i]) chooses, backtrack() explores deeper, current.remove(current.size() - 1) un-chooses so the next loop iteration tries a different element. The used[] boolean array prevents reusing elements within one permutation. result.add(new ArrayList<>(current)) creates a COPY — without it, all entries would reference the same eventually-empty list.

## BREAK_IT
setup:
```java
private static void backtrack(int[] nums, List<Integer> current,
                               boolean[] used, List<List<Integer>> result) {
    if (current.size() == nums.length) {
        result.add(new ArrayList<>(current));
        return;
    }
    for (int i = 0; i < nums.length; i++) {
        if (used[i]) continue;
        current.add(nums[i]);
        used[i] = true;
        backtrack(nums, current, used, result);
        current.remove(current.size() - 1);
        used[i] = false;
    }
}
// nums = {1, 2, 3}
```
modification: What if we remove the `current.remove(current.size() - 1)` and `used[i] = false` lines?
question: How many "permutations" would we get for nums = {1, 2, 3}?
options: [1, 6, Infinite loop / StackOverflowError]
correct: 0
explanation: Without the UN-CHOOSE step, after finding [1,2,3] the method returns, but current still contains [1,2,3] and used[] is all true. Back in the for-loop, every used[i] is true so `if (used[i]) continue` skips all elements — no further recursion occurs. We get exactly ONE permutation. The current.remove and used[i] = false lines undo the choice, allowing the for-loop to try different elements at each position.

## CONTRAST
label: Fibonacci — naive vs memoized recursion
codeA:
```java
// Naive recursion: O(2^n) time — exponential!
public static int fibNaive(int n) {
    if (n <= 1) return n;
    return fibNaive(n - 1) + fibNaive(n - 2);
}
// fib(5) calls fib(4) + fib(3)
// fib(4) calls fib(3) + fib(2)  ← fib(3) computed AGAIN!
// Total calls for fib(40): ~300 million
```
codeB:
```java
// Memoized recursion: O(n) time — linear!
public static int fibMemo(int n, Map<Integer, Integer> memo) {
    if (n <= 1) return n;
    if (memo.containsKey(n)) return memo.get(n);
    int result = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
    memo.put(n, result);
    return result;
}
// fib(5) computes fib(4), fib(3), fib(2), fib(1), fib(0)
// Each computed exactly ONCE. Total calls for fib(40): 40
```
question: Why does memoization reduce Fibonacci from O(2^n) to O(n)?
options: [Each subproblem is computed once because memo.containsKey returns the cached result, It uses less stack space, The base case is different, It avoids recursion entirely]
correct: 0
explanation: Naive Fibonacci recomputes the same values exponentially — fibNaive(3) is called millions of times when computing fibNaive(40). With memoization, after the first computation memo.put(n, result) stores the answer. On subsequent calls, memo.containsKey(n) returns true and memo.get(n) gives the cached value in O(1). Each of the n subproblems is solved exactly once — O(n) total.

## EXPLAIN_BACK
mode: pick_best
prompt: What does the UN-CHOOSE step accomplish in the backtracking template?
options: [current.remove and used[i] = false undo the choice so the for-loop can try a different element at that position, It prevents StackOverflowError by reducing recursion depth, It sorts the result list after each permutation is found, It resets the base case condition for the next recursive call]
correct: 0

## CONNECT
text: Recursion and backtracking appear in SDET work more than you'd expect:
```java
// Generating all combinations of test parameters (combinatorial testing)
public static List<List<String>> generateTestCombinations(
        List<List<String>> parameterSets) {
    List<List<String>> result = new ArrayList<>();
    generate(parameterSets, 0, new ArrayList<>(), result);
    return result;
}

private static void generate(List<List<String>> params, int depth,
                              List<String> current, List<List<String>> result) {
    if (depth == params.size()) {
        result.add(new ArrayList<>(current));
        return;
    }
    for (String value : params.get(depth)) {
        current.add(value);
        generate(params, depth + 1, current, result);
        current.remove(current.size() - 1);
    }
}
// Input: [["Chrome","Firefox"], ["Login","Checkout"], ["US","EU"]]
// Output: All 8 test combinations
```
note: Combinatorial test generation is backtracking. Understanding this pattern lets you build smarter test data generators that explore all meaningful input combinations systematically — a core SDET skill for achieving coverage without redundancy.
