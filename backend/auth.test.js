import request from "supertest";
import app from "./server.js";
import dotenv from "dotenv";
import { pool } from "../backend/dbUtils/sql_utl/db.js";
import redis from "./dbUtils/redisConnect.js";
import mongoose from "mongoose";
dotenv.config();

let userA = {};
let userB = {};
let groupId = "";

const random = () => Math.floor(Math.random() * 100000);

describe("🚀 FULL E2E + SECURITY + EDGE TEST SUITE", () => {

    // ======================
    // AUTH SETUP
    // ======================

    it("register user A", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                email: `a${random()}@test.com`,
                username: "userA",
                password: "123456"
            });

        expect(res.statusCode).toBe(201);
        userA.token = res.body.jwt;
        userA.id = res.body.Uid;
    });

    it("register user B", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                email: `b${random()}@test.com`,
                username: "userB",
                password: "123456"
            });

        expect(res.statusCode).toBe(201);
        userB.token = res.body.jwt;
        userB.id = res.body.Uid;
    });

    // ======================
    // GROUP FLOW
    // ======================

    it("user A creates group", async () => {
        const res = await request(app)
            .post("/api/group/create-group")
            .set("Authorization", `Bearer ${userA.token}`)
            .send({ group_name: "test-group" });

        expect(res.statusCode).toBe(201);
        expect(res.body.result._id).toBeDefined();

        groupId = res.body.result._id;
    });

    it("user B requests to join group", async () => {
        const res = await request(app)
            .post("/api/group/join")
            .set("Authorization", `Bearer ${userB.token}`)
            .send({ groupChatId: groupId });

        expect([200, 409]).toContain(res.statusCode);
    });

    it("admin fetches join requests", async () => {
        const res = await request(app)
            .post("/api/group/requests")
            .set("Authorization", `Bearer ${userA.token}`)
            .send({ groupId });

        expect(res.statusCode).toBe(200);
    });

    it("admin accepts join request", async () => {
        const res = await request(app)
            .post("/api/group/accept-request")
            .set("Authorization", `Bearer ${userA.token}`)
            .send({
                groupId,
                requesterId: userB.id
            });

        expect([200, 201]).toContain(res.statusCode);
    });

    it("user B sees joined group", async () => {
        const res = await request(app)
            .get("/api/group/my")
            .set("Authorization", `Bearer ${userB.token}`);

        expect(res.statusCode).toBe(200);
    });

    it("user B accesses group chat", async () => {
        const res = await request(app)
            .post("/api/group/chat")
            .set("Authorization", `Bearer ${userB.token}`)
            .send({ group_id: groupId });

        expect([200, 403]).toContain(res.statusCode);
    });

    it("search group", async () => {
        const res = await request(app)
            .post("/api/group/search")
            .set("Authorization", `Bearer ${userA.token}`)
            .send({ query: groupId });

        expect(res.statusCode).toBe(200);
    });

    // ======================
    // SECURITY TESTS
    // ======================

    it("should reject join without token", async () => {
        const res = await request(app)
            .post("/api/group/join")
            .send({ groupChatId: groupId });

        expect([401, 403]).toContain(res.statusCode);
    });

    it("should reject invalid token", async () => {
        const res = await request(app)
            .get("/api/group/my")
            .set("Authorization", "Bearer invalidtoken");

        expect([401, 403]).toContain(res.statusCode);
    });

    // ======================
    // AUTHORIZATION TESTS
    // ======================

    it("non-admin should NOT delete group", async () => {
        const res = await request(app)
            .post("/api/group/delete-group")
            .set("Authorization", `Bearer ${userB.token}`)
            .send({ groupChatId: groupId });

        expect(res.statusCode).toBe(403);
    });

    // ======================
    // DATA INTEGRITY
    // ======================

    it("user should not join twice", async () => {
        const res = await request(app)
            .post("/api/group/join")
            .set("Authorization", `Bearer ${userB.token}`)
            .send({ groupChatId: groupId });

        expect(res.statusCode).toBe(409);
    });

    // ======================
    // EDGE CASES
    // ======================

    it("invalid ObjectId should fail gracefully", async () => {
        const res = await request(app)
            .post("/api/group/chat")
            .set("Authorization", `Bearer ${userA.token}`)
            .send({ group_id: "invalid-id" });

        expect([400, 500]).toContain(res.statusCode);
    });

    it("empty search should return safely", async () => {
        const res = await request(app)
            .post("/api/group/search")
            .set("Authorization", `Bearer ${userA.token}`)
            .send({ query: "nonexistent123" });

        expect(res.statusCode).toBe(200);
    });

    // ======================
    // DELETE FLOW
    // ======================

    it("admin deletes group", async () => {
        const res = await request(app)
            .post("/api/group/delete-group")
            .set("Authorization", `Bearer ${userA.token}`)
            .send({ groupChatId: groupId });

        expect(res.statusCode).toBe(200);
    });

    // ======================
    // CLEANUP
    // ======================

    afterAll(async () => {
        await pool.end();
        await mongoose.connection.close();
        await redis.quit();
    });

});