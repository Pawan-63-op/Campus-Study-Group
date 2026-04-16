import Redis from "ioredis";
let redis;
try {
    redis = new Redis({
    host:"127.0.0.1",
    port:6379
});
console.log("redis connected");
} catch (e) {
    console.error(e);
    console.log("failed to connect to redis");
}

export default redis;