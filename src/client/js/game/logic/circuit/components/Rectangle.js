const Component = require("./Component");

class Rectangle extends Component {
  constructor(data) {
    data.shape = "Rectangle";
    super(data);
    this.width = data.width;
    this.height = data.height;
    this.x = data.x;
    this.y = data.y;
  }

  getHandles() {
    return [];
  }
}

module.exports = Rectangle;
