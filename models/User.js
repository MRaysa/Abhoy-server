const { ObjectId } = require('mongodb');
const { getDB } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static collectionName = 'users';

  static async create(userData) {
    const db = getDB();
    const collection = db.collection(this.collectionName);

    // Hash password if provided
    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(userData.password, salt);
    }

    const user = {
      ...userData,
      role: userData.role || 'employee', // Default role
      isActive: userData.isActive !== undefined ? userData.isActive : true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: new Date()
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
    return await collection.findOne({ email: email.toLowerCase() });
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

    // Hash password if being updated
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

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

  static async updateLastLogin(id) {
    const db = getDB();
    const collection = db.collection(this.collectionName);

    return await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          lastLogin: new Date(),
          updatedAt: new Date()
        }
      }
    );
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

  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Remove sensitive data before sending
  static sanitize(user) {
    if (!user) return null;
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}

module.exports = User;
