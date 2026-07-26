---
unit: p4u5
title: Stacks & Queues
teaches: [dsa.stack_brackets, dsa.queue_bfs, dsa.deque_operations]
requires: [collections.arraylist, basics.types, dsa.array_traversal]
---

## HOOK
question: You're building a code linter. Given the string `"{[()()]}"`, how do you verify every bracket is properly matched and nested? You can't just count opens vs closes — `"([)]"` has equal counts but is WRONG. What data structure naturally tracks "the most recently opened bracket that hasn't been closed yet"?
```java
// Stack! Last In, First Out.
// Read "{": push '{'. Stack: ['{']
// Read "[": push '['. Stack: ['{', '[']
// Read "(": push '('. Stack: ['{', '[', '(']
// Read ")": pop '(' — matches! Stack: ['{', '[']
// Read "(": push '('. Stack: ['{', '[', '(']
// Read ")": pop '(' — matches! Stack: ['{', '[']
// Read "]": pop '[' — matches! Stack: ['{']
// Read "}": pop '{' — matches! Stack: []
// Stack empty at end = VALID!
```

## FAIL_FIRST
prompt: Validate if a string of brackets is properly matched. Complete the stack logic.
```java
import java.util.Stack;

public class BracketValidator {
    public static boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(' || c == '[' || c == '{') {
                // TODO: Push the corresponding closing bracket
            } else {
                // TODO: If stack is empty OR top doesn't match c, return false
                // TODO: Otherwise pop the top
            }
        }
        // TODO: Return true only if stack is empty
        return false;
    }

    public static void main(String[] args) {
        System.out.println(isValid("({[]})")); // Expected: true
        System.out.println(isValid("([)]"));   // Expected: false
        System.out.println(isValid("("));      // Expected: false
    }
}
```
hint: Push the EXPECTED closing bracket. When you encounter a closer, check if it matches what's on top.
expected: true

## ANALOGY
A Stack is a stack of plates in a cafeteria — you can only take the top plate (LIFO: Last In, First Out). This makes it perfect for "undo" operations and matching nested structures. A Queue is a line at a coffee shop — first person in line gets served first (FIFO: First In, First Out). This makes it perfect for processing items in order, like BFS where you explore nodes level by level. A Deque (Double-Ended Queue) is a train — passengers can board and exit from either end.

## CODE
```java
import java.util.*;

// Pattern 1: Stack for bracket validation
public static boolean isValidBrackets(String s) {
    Stack<Character> stack = new Stack<>();
    for (char c : s.toCharArray()) {
        if (c == '(') stack.push(')');
        else if (c == '[') stack.push(']');
        else if (c == '{') stack.push('}');
        else if (stack.isEmpty() || stack.pop() != c) return false;
    }
    return stack.isEmpty();
}

// Pattern 2: Queue for BFS (level-order processing)
public static List<List<Integer>> processLevels(int[][] graph, int start) {
    List<List<Integer>> levels = new ArrayList<>();
    Queue<Integer> queue = new LinkedList<>();
    boolean[] visited = new boolean[graph.length];
    queue.offer(start);
    visited[start] = true;

    while (!queue.isEmpty()) {
        int levelSize = queue.size();
        List<Integer> currentLevel = new ArrayList<>();
        for (int i = 0; i < levelSize; i++) {
            int node = queue.poll();
            currentLevel.add(node);
            for (int neighbor : graph[node]) {
                if (!visited[neighbor]) {
                    visited[neighbor] = true;
                    queue.offer(neighbor);
                }
            }
        }
        levels.add(currentLevel);
    }
    return levels;
}

// Pattern 3: Deque as both Stack and Queue
public static int[] slidingWindowMax(int[] nums, int k) {
    Deque<Integer> deque = new ArrayDeque<>(); // stores indices
    int[] result = new int[nums.length - k + 1];

    for (int i = 0; i < nums.length; i++) {
        // Remove elements outside window from front
        while (!deque.isEmpty() && deque.peekFirst() < i - k + 1) {
            deque.pollFirst();
        }
        // Remove smaller elements from back (they'll never be max)
        while (!deque.isEmpty() && nums[deque.peekLast()] < nums[i]) {
            deque.pollLast();
        }
        deque.offerLast(i);
        if (i >= k - 1) {
            result[i - k + 1] = nums[deque.peekFirst()];
        }
    }
    return result;
}
```
highlight: [7, 8, 9, 10]
annotation: The bracket trick — push the EXPECTED closer (e.g., '(' triggers stack.push(')')). Then checking is just stack.pop() != c. Queue BFS uses levelSize = queue.size() to process one level at a time via queue.poll() and queue.offer(). Deque maintains a decreasing-order window using pollFirst/pollLast for O(n) sliding maximum.

## BREAK_IT
setup:
```java
public static boolean isValidBrackets(String s) {
    Stack<Character> stack = new Stack<>();
    for (char c : s.toCharArray()) {
        if (c == '(') stack.push(')');
        else if (c == '[') stack.push(']');
        else if (c == '{') stack.push('}');
        else if (stack.isEmpty() || stack.pop() != c) return false;
    }
    return stack.isEmpty();
}
// Input: "("
```
modification: What if we change the last line to `return true` instead of `return stack.isEmpty()`?
question: What would isValidBrackets("(") return?
options: [true — incorrectly!, false, Throws EmptyStackException]
correct: 0
explanation: The input "(" triggers stack.push(')'), so the stack contains [')']. The for-loop ends without entering the else-if branch (no closing bracket in the input). If we return true unconditionally, the unclosed opener is never caught. Returning stack.isEmpty() checks that every push from an opener was matched by a pop from a closer — the stack must be empty for all brackets to be balanced.

## CONTRAST
label: Stack vs Queue — choosing the right structure
codeA:
```java
// Stack (LIFO): Undo/bracket matching/DFS
Stack<String> undoHistory = new Stack<>();
undoHistory.push("typed 'Hello'");
undoHistory.push("typed ' World'");
undoHistory.push("deleted ' World'");
// Undo last action:
String lastAction = undoHistory.pop(); // "deleted ' World'"
```
codeB:
```java
// Queue (FIFO): Task processing/BFS/scheduling
Queue<String> taskQueue = new LinkedList<>();
taskQueue.offer("Test login API");
taskQueue.offer("Test payment API");
taskQueue.offer("Test logout API");
// Process in order:
String nextTask = taskQueue.poll(); // "Test login API"
```
question: You're processing test cases where dependencies must run first. Which structure?
options: [Queue — process in the order added via offer and poll, Stack — process most recent first via push and pop, Either works, Neither — use a List]
correct: 0
explanation: Queue preserves insertion order — dependencies added first via queue.offer are processed first via queue.poll (FIFO). This is BFS/topological order. Stack would return the LAST pushed item first via stack.pop (LIFO), breaking dependency ordering. Test dependency execution follows a queue pattern.

## EXPLAIN_BACK
mode: fill_blank
prompt: How does the bracket validation algorithm use a stack to detect mismatches?
sentence: For each opener we call stack._____ with the expected closer; for each closer we check stack._____ and if the stack is _____ at the end, all brackets matched.
blanks: [push, pop, isEmpty]
distractors: [offer, peek, full]

## CONNECT
text: Stack-based validation appears directly in SDET work:
```java
// Validating JSON/XML response structure
public static boolean isValidJson(String json) {
    Stack<Character> stack = new Stack<>();
    boolean inString = false;
    for (char c : json.toCharArray()) {
        if (c == '"' && !inString) inString = true;
        else if (c == '"' && inString) inString = false;
        else if (!inString) {
            if (c == '{' || c == '[') stack.push(c);
            else if (c == '}' && (stack.isEmpty() || stack.pop() != '{')) return false;
            else if (c == ']' && (stack.isEmpty() || stack.pop() != '[')) return false;
        }
    }
    return stack.isEmpty();
}
```
note: Queue-based BFS is used in test dependency resolution — determining which test suites can run in parallel (no dependencies) vs which must wait. This is the same pattern as build system task scheduling.
