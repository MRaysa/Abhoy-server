const { ObjectId } = require('mongodb');
const { getDB } = require('../config/database');

class User {
  static collectionName = 'users';

  static async create(userData) {
    const db = getDB();
    const collection = db.collection(this.collectionName);

    const user = {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(user);
    return { ...user, _id: result.insertedId };
  }

  static async findById(id) {
    const db = getDB();
    const collection = db.collection(this.collectionName);
    return await collection.findOne({ _id: new ObjectId(id) });
  }

  static async findByEmail(email) {
    const db = getDB();
    const collection = db.collection(this.collectionName);
    return await collection.findOne({ email });
  }

  static async findByUid(uid) {
    const db = getDB();
    const collection = db.collection(this.collectionName);
    return await collection.findOne({ uid });
  }

  static async findAll(query = {}, options = {}) {
    const db = getDB();
    const collection = db.collection(this.collectionName);

    const { skip = 0, limit = 10, sort = { createdAt: -1 } } = options;

    return await collection
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  static async update(id, updateData) {
    const db = getDB();
    const collection = db.collection(this.collectionName);

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    return result;
  }

  static async delete(id) {
    const db = getDB();
    const collection = db.collection(this.collectionName);
    return await collection.deleteOne({ _id: new ObjectId(id) });
  }

  static async count(query = {}) {
    const db = getDB();
    const collection = db.collection(this.collectionName);
    return await collection.countDocuments(query);
  }
}

module.exports = User;
