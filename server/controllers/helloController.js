module.exports = class HelloController {
  static getHello(req, res) {
    res.json({ message: "Hello world!" });
  }
};
