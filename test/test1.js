// Tính tổng số nguyên tố <= N
const N = 200000;
const isPrime = Array(N + 1).fill(true);
isPrime[0] = isPrime[1] = false;

for (let i = 2; i * i <= N; i++) {
    if (isPrime[i]) {
        for (let j = i * i; j <= N; j += i) {
            isPrime[j] = false;
        }
    }
}

let count = 0;
for (let i = 2; i <= N; i++) {
    if (isPrime[i]) count++;
}

console.log("Number of primes:", count);

