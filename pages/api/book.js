import { withIronSessionApiRoute } from "iron-session/next";
import sessionOptions from "../../config/session";
import db from "../../db";

// this handler runs for /api/book with any request method (GET, POST, etc)
export default withIronSessionApiRoute(async function handler(req, res) {
  // User info can be accessed with req.session
  // 401 if !user
  const user = req.session.user;
  if (!user) return res.status(401).json("User not Found!");

  switch (req.method) {
    // On a POST request, add a book using db.book.add with request body (must use JSON.parse)
    case "POST":
      try {
        const data = JSON.parse(req.body);
        const addBook = await db.book.add(user.id, data);
        // 401 if db.book.add returns null, destroy session
        if (addBook === null) {
          req.session.destroy();
          return res.status(401).end();
        }

        return res.status(200).json(addBook);
      } catch (error) {
        //400 JSON error.message when remove throws e
        return res.status(400).json({ error: error.message });
      }

    case "DELETE":
      // On a DELETE request, remove a book using db.book.remove with request body (must use JSON.parse)
      try {
        const data = JSON.parse(req.body);
        const removeBook = await db.book.remove(user.id, data.id);
        // 401 if db.book.remove returns null, destroy session
        if (removeBook === null) {
          req.session.destroy();
          return res.status(401).end();
        }
        return res.status(200).json(removeBook);
      } catch (error) {
        //400 JSON error.message when remove throws e
        return res.status(400).json({ error: error.message });
      }

    default:
      // Respond with 404 for all other requests
      return res.status(404).end();
  }
}, sessionOptions);
