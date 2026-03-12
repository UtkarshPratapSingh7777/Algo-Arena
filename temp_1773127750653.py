n = int(input())
g = list(map(int, input().split()))

m = int(input())
s = list(map(int, input().split()))

g.sort()
s.sort()

i = 0
j = 0
count = 0

while i < n and j < m:
    if s[j] >= g[i]:
        count += 1
        i += 1
        j += 1
    else:
        j += 1

print(count)