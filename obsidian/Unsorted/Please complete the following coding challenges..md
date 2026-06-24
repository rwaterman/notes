# **Challenges**

## **Live Coding Challenge 1**

**Instructions**: The following script is intended to list all files in the S3 bucket named my-app-bucket and save the results to a file named s3_list.txt. But it doesn’t work as expected. Please fix the script.


```
#!/bin/bash

bucket="my-app-bucket"
aws s3 ls s3://${bucket} > "s3_list.txt
echo "Done listing"
```


## **Live Coding Challenge 2**

**Instructions**: The following script is supposed to count how many words are in a given sentence, but it’s broken. Please fix it.


```
def count_words(sentence):
    words = sentence.split(",")
    return len(words)

print(count_words("Hello world this is a test"))
```


**Expected output:** 6 
**Current output:** 1

## **Live Coding Challenge 3**

**Instructions**: Write a Bash or Python script that reads a log file line by line and prints:

1. The total number of lines
2. The number of lines containing the word ERROR


```
[2025-04-30 10:15:20] INFO - User logged in
[2025-04-30 10:16:01] ERROR - Timeout connecting to DB
```


# **Solutions**


```
#!/bin/bash

bucket="my-app-bucket"
aws s3 ls s3://${bucket} > "s3_list.txt"
echo "Done listing"
```



```
def count_words(sentence):
    words = sentence.split()
    return len(words)

print(count_words("Hello world this is a test"))
```



```
def analyze_logs(file_path):
    total_lines = 0
    error_lines = 0

    with open(file_path, 'r') as f:
        for line in f:
            total_lines += 1
            if "ERROR" in line:
                error_lines += 1

    print(f"Total lines: {total_lines}")
    print(f"Lines with ERROR: {error_lines}")
```


*or*


```
#!/bin/bash
file="log.txt"
total=$(wc -l < "$file")
errors=$(grep -c "ERROR" "$file")

echo "Total lines: $total"

echo "Lines with ERROR: $errors"
```