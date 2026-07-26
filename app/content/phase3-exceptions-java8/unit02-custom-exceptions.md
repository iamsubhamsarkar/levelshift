---
unit: p3u2
title: Custom Exceptions
teaches: [exceptions.custom, exceptions.chaining, exceptions.bestpractices]
requires: [exceptions.trycatch, exceptions.hierarchy, oop.inheritance, oop.constructors]
---

## HOOK
question: This test framework has a custom exception. Why didn't they just use RuntimeException directly?
```java
throw new ElementNotInteractableException(
    "Button 'Submit' is disabled",
    Duration.ofSeconds(10),
    lastScreenshot
);
```

## FAIL_FIRST
prompt: Create a custom exception that extends Exception. What's the MINIMUM code needed?
```java
public class InvalidAgeException ??? {
    // What goes here?
}
```
hint: It needs to extend Exception and call super() with a message
expected: extends Exception with constructor calling super(message)

## ANALOGY
Custom exceptions are like custom error codes in an HTTP API. You COULD return 500 for everything, but returning 404 (not found), 401 (unauthorized), or 422 (validation failed) tells the caller EXACTLY what went wrong and how to fix it. Custom exceptions do the same — instead of generic RuntimeException("something broke"), you throw InvalidCredentialsException or TestDataNotFoundException with specific context.

## CODE
```java
public class TestDataNotFoundException extends RuntimeException {
    private final String dataKey;

    public TestDataNotFoundException(String key) {
        super("Test data not found: " + key);
        this.dataKey = key;
    }

    public String getDataKey() { return dataKey; }
}
```
highlight: [1, 5]
annotation: Custom exceptions extend RuntimeException (unchecked) or Exception (checked). Include: 1) meaningful class name, 2) constructor calling super(message), 3) optional context fields. Extend RuntimeException for programming errors. Extend Exception for recoverable failures the caller must handle. Use custom exceptions when you need extra context fields or when callers must catch your specific failure separately from other errors.

## BREAK_IT
setup:
```java
public class ApiException extends Exception {
    public ApiException(String msg) { super(msg); }
}

// In test code:
throw new ApiException("Timeout");
```
modification: Remove "extends Exception" — what happens?
question: What happens when a class named "ApiException" doesn't extend any exception class?
options: [Compiles and throws normally, Compile error at throw statement, Runtime error, Works but can't be caught]
correct: 1
explanation: You can only throw objects that extend Throwable. Without "extends Exception", ApiException is just a regular class — not part of the exception hierarchy. The throw statement requires a Throwable type, so the compiler rejects it. Custom exceptions must extend RuntimeException or Exception.

## CONTRAST
label: Exception chaining — wrapping the original cause
codeA:
```java
// BAD: loses original error details
catch (SQLException e) {
    throw new TestException("DB failed");
    // Original stack trace LOST!
}
```
codeB:
```java
// GOOD: chains the original cause
catch (SQLException e) {
    throw new TestException("DB failed", e);
    // Original stack trace PRESERVED!
}
```
question: Why does passing the original exception (e) matter?
options: [Preserves the root cause stack trace, Required by Java, Improves performance, Only matters in production]
correct: 0
explanation: Exception chaining preserves the full error trail. When debugging "TestException: DB failed", you can call getCause() to find the original exception with its specific context. Without chaining, you lose the root cause — passing the original exception in the constructor calling super(message, cause) keeps the entire stack trace visible.

## BREAK_IT
setup:
```java
public class RetryException extends RuntimeException {
    private int attempts;

    public RetryException(String msg, int attempts, Throwable cause) {
        super(msg, cause);
        this.attempts = attempts;
    }
}

// Usage:
try {
    callApi();
} catch (IOException e) {
    throw new RetryException("Failed after 3 tries", 3, e);
}
```
modification: Change RetryException to extend Exception (checked). What must change in calling code?
question: After making RetryException checked, what does the compiler demand?
options: [Nothing changes, Callers must add try/catch or throws, Must remove the cause parameter, Must make it final]
correct: 1
explanation: Switching from RuntimeException (unchecked) to Exception makes it checked. Now every method that throws RetryException must declare it with "throws RetryException", and every caller must either catch it or propagate it. This is why test framework exceptions typically extend RuntimeException — you don't want try/catch in every test method.

## EXPLAIN_BACK
mode: pick_best
prompt: When should you create a custom exception instead of using an existing one like RuntimeException?
options: [When you need extra context fields and callers must catch your specific failure separately, When you want your code to look more professional, When the standard exceptions are too slow, When Java requires it for all error handling]
correct: 0

## CONNECT
text: Test frameworks are BUILT on custom exceptions:
```java
// Selenium's hierarchy:
WebDriverException
  ├── NoSuchElementException
  ├── TimeoutException
  ├── StaleElementReferenceException
  └── ElementNotInteractableException

// Your own framework might add:
public class PageLoadException extends RuntimeException {
    private final String pageUrl;
    private final Duration waitTime;
}
```
note: When you build test frameworks in Phase 6+, you'll create custom exceptions for retry logic, page timeouts, and test data failures. Each carries context that makes debugging test failures 10x faster than generic "something failed" messages.
