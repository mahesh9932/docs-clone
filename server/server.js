const express = require("express");
const { createServer, request } = require("node:http");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");

const cors = require("cors");

const { PrismaClient } = require("@prisma/client");

const app = express();
app.use(bodyParser.json());
const prisma = new PrismaClient();

app.use(cors());
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["*"],
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  // console.log("new connection with socket Id", socket.id);
  socket.on("send-change", (delta, documentId) => {
    // console.log("message recieved", delta);
    socket.broadcast.to(documentId).emit("recieve-change", delta);
  });
  socket.on("join-room", (documentId) => {
    socket.join(documentId);
  });
});

const isUserAuthenticated = (req, res, next) => {
  // console.log("headers are", req.headers.email, !req.headers.email);
  if (!req.headers.email) {
    // console.log("un accesible");
    return res.status(403).json({
      msg: "Not accesible",
    });
  }

  // console.log("calling next");
  next();
};

app.get("/contents/:id", isUserAuthenticated, async (req, res) => {
  const documentId = req.params.id;

  if (!documentId) {
    return res.status(422).json({ msg: "invalid document id" });
  }

  try {
    const doc = await prisma.docs.findUnique({
      where: {
        documentId: documentId,
        userId: {
          has: req.headers.email,
        },
      },
    });
    if (!doc) {
      return res.status(200).json({ content: "" });
    }
    return res.status(200).json({ content: doc.content });
  } catch (e) {
    // console.log("error ", e);
    return res
      .status(422)
      .json({ msg: "error while getting the contents of the document" });
  }
});

app.post("/create/:id", isUserAuthenticated, async (req, res) => {
  const documentId = req.params.id;
  const email = req.headers.email;
  // console.log("create query running.....", documentId, email);

  // console.log("params in create doc", req.params);
  if (!documentId) {
    return res.status(422).json({ msg: "invalid document id" });
  }
  try {
    let doc = await prisma.docs.findUnique({
      where: {
        documentId: documentId,
        userId: {
          has: email,
        },
      },
    });

    // console.log("docs finded", doc);
    if (doc) {
      return res.status(200).json({ msg: "document already created" });
    }

    doc = await prisma.docs.create({
      data: {
        documentId: documentId,
        name: documentId,
        userId: [email],
      },
    });
    // console.log(doc);
  } catch (e) {
    // console.log("error while creating the doc", e);
    return res.status(422).json({
      msg: "error while creating the document",
      error: JSON.stringify(e),
    });
  }

  return res.status(200).json({ msg: "document created succesfully" });
});

app.delete("/:id", isUserAuthenticated, async (req, res) => {
  const documentId = req.params.id;
  if (!documentId) {
    return res.status(422).json({ msg: "invalid document id" });
  }
  try {
    const response = await prisma.docs.delete({
      where: {
        documentId: documentId,
        userId: {
          has: req.headers.email,
        },
      },
    });
    return res.status(200).json({ msg: "Deleted document succesfully" });
  } catch (e) {
    // console.log(e);
    return res.status(422).json({ msg: JSON.stringify(e) });
  }
});

app.put("/addUser/:id", isUserAuthenticated, async (req, res) => {
  console.log("inside add user");
  const documentId = req.params.id;
  console.log("document id", documentId, req.headers);
  if (!documentId) {
    return res.status(422).json({ msg: "invalid document id" });
  }
  const newEmail = req.headers.newemail;

  if (!newEmail) {
    return res.status(422).json({ msg: "invalid new Email" });
  }

  try {
    let doc = await prisma.docs.findUnique({
      where: {
        documentId: documentId,
        userId: {
          has: req.headers.email,
        },
      },
    });

    if (!doc) {
      return res
        .status(422)
        .json({ msg: "doesn't found the document with id" });
    }

    doc = await prisma.docs.update({
      where: { documentId: documentId, userId: { has: req.headers.email } },
      data: {
        userId: [...doc.userId, newEmail],
      },
    });

    // console.log("updated doc is", doc);
  } catch (e) {
    return res
      .status(500)
      .json({ msg: "error while adding the user", error: JSON.stringify(e) });
  }

  return res.status(200).json({
    msg: "user added succesfully",
  });
});

app.put("/update/:id", isUserAuthenticated, async (req, res) => {
  // console.log("inside the update");
  const documentId = req.params.id;
  const data = req.body;

  // console.log("req.headers", req.headers);

  if (!documentId) {
    return res.status(422).json({ msg: "invalid document id" });
  }
  let docs;
  try {
    docs = await prisma.docs.findUnique({
      where: {
        documentId: documentId,
        userId: {
          has: req.headers.email,
        },
      },
    });

    if (!docs) {
      return res.status(422).json({ msg: "document not created yet" });
    }

    docs = await prisma.docs.update({
      where: { documentId: documentId, userId: { has: req.headers.email } },
      data: {
        content: data.content,
      },
    });
    // console.log(docs);
  } catch (e) {
    // console.log("error while creating the doc", e);
    return res.status(422).json({
      msg: "error while saving the document",
      error: JSON.stringify(e),
    });
  }

  return res.status(200).send({ msg: "document updated succesfully" });
});

app.get("/docs", isUserAuthenticated, async (req, res) => {
  const data = await prisma.docs.findMany({
    where: {
      userId: {
        has: req.headers.email,
      },
    },
    orderBy: {
      documentId: "desc",
    },
  });
  return res.json({ docs: data });
});

app.get("/doc/name/:id", isUserAuthenticated, async (req, res) => {
  // console.log("user authenticating passed");
  const documentId = req.params.id;
  const data = await prisma.docs.findUnique({
    where: {
      documentId: documentId,
      userId: {
        has: req.headers.email,
      },
    },
  });
  if (!data) {
    return res.status(404).json({ msg: "document not found" });
  }
  return res.status(200).json({ fileName: data.name });
});

app.put("/doc/name/:id", isUserAuthenticated, async (req, res) => {
  const documentId = req.params.id;
  const fileName = req.body.fileName;

  if (fileName === "") {
    return res.status(422).json({ msg: "File name cannot be empty" });
  }

  const data = await prisma.docs.findUnique({
    where: {
      documentId: documentId,
      userId: { has: req.headers.email },
    },
  });

  // console.log("data", data);
  if (!data) {
    return res.status(404).json({ msg: "document not found" });
  }
  const doc = await prisma.docs.update({
    where: {
      documentId: documentId,
      userId: { has: req.headers.email },
    },
    data: {
      name: fileName,
    },
  });
  return res.status(200).json({ msg: "filename updated succesfully" });
});

app.get("/", (req, res) => {
  res.json({ msg: "working fine" });
});

try {
  server.listen(3001, () => {
    console.log("server running at http://localhost:3001");
  });
} catch (e) {
  console.log("error while running the server", e);
}
