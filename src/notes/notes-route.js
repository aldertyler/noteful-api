const path = require("path");
const express = require("express");
const xss = require("xss");
const NotesService = require("./notes-service");
const notesRouter = express.Router();
const jsonParser = express.json();
const logger = require("../logger");

const serializeNotes = (note) => ({
  id: note.id,
  title: xss(note.title),
  modified: note.modified,
  content: xss(note.content),
  folderid: note.folderid,
});

notesRouter
  .route("/")
  .get((req, res, next) => {
    const knexInstance = req.app.get("db");
    NotesService.getAllNotes(knexInstance)
      .then((notes) => {
        res.json(notes.map((note) => serializeNotes(note)));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { title, content, folderid } = req.body;
    const newNote = { title, content };

    for (const [key, value] of Object.entries(newNote)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body.` },
        });
      }
    }

    newNote.title = title;
    newNote.content = content;
    newNote.folderid = folderid;
    console.log(newNote);
    NotesService.insertNote(req.app.get("db"), newNote)
      .then((note) => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${note.id}`))
          .json(serializeNotes(note));
      })
      .catch(next);
  });

notesRouter
  .route("/:noteId")
  .all((req, res, next) => {
    NotesService.getById(req.app.get("db"), req.params.noteId)
      .then((note) => {
        if (!note) {
          return res.status(404).json({
            error: { message: `Note does not exist.` },
          });
        }
        res.note = note;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(serializeNotes(res.note));
  })
  .delete((req, res, next) => {
    NotesService.deleteNote(
      req.app.get("db"),
      req.params.noteId //or const { id } = req.params?
    )
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const { title, content } = req.body;
    const noteToUpdate = { title, content };

    const numberOfValues = Object.values(noteToUpdate).filter(Boolean).length;
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must contain either 'title' or 'content'.`,
        },
      });

    NotesService.updateNote(req.app.get("db"), req.params.noteId, noteToUpdate)
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = notesRouter;
