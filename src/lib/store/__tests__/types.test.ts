import { describe, it, expect, beforeEach } from "vitest";
import { createCollection } from "../types";

describe("createCollection", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("creates a collection with list, create, remove, update", () => {
    const collection = createCollection("testCollection");

    expect(collection.list()).toEqual([]);

    const item = collection.create({ name: "Test Item" });
    expect(item._id).toBeDefined();
    expect(item.name).toBe("Test Item");
    expect(item.createdAt).toBeDefined();
    expect(item.updatedAt).toBeDefined();

    expect(collection.list().length).toBe(1);
    expect(collection.list()[0].name).toBe("Test Item");
  });

  it("removes items by id", () => {
    const collection = createCollection("testRemove");

    const item = collection.create({ name: "To Remove" });
    expect(collection.list().length).toBe(1);

    collection.remove(item._id);
    expect(collection.list().length).toBe(0);
  });

  it("updates items by id", () => {
    const collection = createCollection("testUpdate");

    const item = collection.create({ name: "Original" });
    collection.update(item._id, { name: "Updated" });

    expect(collection.list()[0].name).toBe("Updated");
  });

  it("prepends items when prepend option is set", () => {
    const collection = createCollection("testPrepend", { prepend: true });

    collection.create({ name: "First" });
    collection.create({ name: "Second" });

    const items = collection.list();
    expect(items.length).toBe(2);
    expect(items[0].name).toBe("Second");
    expect(items[1].name).toBe("First");
  });

  it("appends items by default", () => {
    const collection = createCollection("testAppend");

    collection.create({ name: "First" });
    collection.create({ name: "Second" });

    const items = collection.list();
    expect(items.length).toBe(2);
    expect(items[0].name).toBe("First");
    expect(items[1].name).toBe("Second");
  });

  it("persists to localStorage", () => {
    const collection = createCollection("testPersist");

    collection.create({ name: "Persisted" });
    const raw = localStorage.getItem("pv_testPersist");
    expect(raw).toBeDefined();

    const parsed = JSON.parse(raw!);
    expect(parsed.length).toBe(1);
    expect(parsed[0].name).toBe("Persisted");
  });

  it("generates unique ids", () => {
    const collection = createCollection("testIds");

    const a = collection.create({});
    const b = collection.create({});

    expect(a._id).not.toBe(b._id);
  });
});
