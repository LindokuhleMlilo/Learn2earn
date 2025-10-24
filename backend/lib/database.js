// lib/database.js
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

let db = null;

export async function getDB() {
  if (!db) {
    db = await open({
      filename: './earnwise.db',
      driver: sqlite3.Database
    });
    
    // Initialize tables
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        wallet_address TEXT UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS completed_lessons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        lesson_id TEXT,
        completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        reward_amount INTEGER,
        transaction_hash TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id)
      );
      
      CREATE TABLE IF NOT EXISTS user_balances (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        balance INTEGER DEFAULT 0,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      );
    `);
  }
  return db;
}