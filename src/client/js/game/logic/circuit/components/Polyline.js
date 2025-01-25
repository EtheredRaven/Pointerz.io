const Component = require("./Component");

class Polyline extends Component {
  constructor(data) {
    data.shape = "Polyline";
    super(data);
    this.pointsList = data.pointsList;
    this.points = this.pointsList;
  }
}

module.exports = Polyline;
