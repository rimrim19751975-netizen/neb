const { db } = require("./db.js");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const users = db.prepare("SELECT * FROM users").all();
  const courses = db.prepare("SELECT * FROM courses").all();
  const submissions = db.prepare("SELECT * FROM submissions").all();
  const notifications = db.prepare("SELECT * FROM notifications").all();

  res.json({ users, courses, submissions, notifications });
};