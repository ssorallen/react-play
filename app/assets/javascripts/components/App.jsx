// FROM https://raw.githubusercontent.com/ssorallen/react-reddit-client/master/react-reddit-client.js
// except minus the React.render at the bottom. That's in main.scala.html
var NavigationItem = React.createClass({
  onClick: function() {
    this.props.itemSelected(this.props.item);
  },
  render: function() {
    return (
      <li onClick={this.onClick} className={this.props.selected ? "selected" : ""}>
        {this.props.item.data.display_name}
      </li>
    );
  }
});

var Navigation = React.createClass({
  setSelectedItem: function(item) {
    this.props.itemSelected(item);
  },
  render: function() {
    var items = this.props.items
      .sort(function(a, b) {
        // Sort by # of subscribers in descending order
        return b.data.subscribers - a.data.subscribers;
      })
      .map(function(item) {
        return (
          <NavigationItem
            item={item}
            itemSelected={this.setSelectedItem}
            key={item.data.id}
            selected={item.data.url === this.props.activeUrl} />
        );
      }, this);

    return (
      <div className="navigation">
        <div className="header">Navigation</div>
        <ul>
            {items}
        </ul>
      </div>
    );
  }
});

var StoryList = React.createClass({
  render: function() {
    var storyNodes = this.props.items.map(function(item) {
      return (
        <tr key={item.data.id}>
          <td>
            <p className="score">{item.data.score}</p>
          </td>
          <td>
            <p className="title">
              <a href={item.data.url}>
                {item.data.title}
              </a>
            </p>
            <p className="author">
              Posted by <b>{item.data.author}</b>
            </p>
          </td>
        </tr>
      );
    });

    return (
      <table>
        <tbody>
          {storyNodes}
        </tbody>
      </table>
    );
  }
});

var App = React.createClass({
  componentDidMount: function() {
    var _this = this;
    var cbname = "fn" + Date.now();
    var script = document.createElement("script");
    script.src = "http://www.reddit.com/reddits.json?jsonp=" + cbname;

    window[cbname] = function(jsonData) {
      _this.setState({
        navigationItems: jsonData.data.children
      });
      delete window[cbname];
    };

    document.head.appendChild(script);
  },
  getInitialState: function() {
    return ({
      activeNavigationUrl: "",
      navigationItems: [],
      storyItems: [],
      title: "Please select a sub"
    });
  },
  render: function() {
    return (
      <div>
        <h1>{this.state.title}</h1>
        <Navigation
          activeUrl={this.state.activeNavigationUrl}
          items={this.state.navigationItems}
          itemSelected={this.setSelectedItem} />
        <StoryList items={this.state.storyItems} />
      </div>
    );
  },
  setSelectedItem: function(item) {
    var _this = this;
    var cbname = "fn" + Date.now();
    var script = document.createElement("script");
    script.src = "http://www.reddit.com/" + item.data.url +
      ".json?sort=top&t=month&jsonp=" + cbname;

    window[cbname] = function(jsonData) {
      _this.setState({storyItems: jsonData.data.children});
      delete window[cbname];
    };

    document.head.appendChild(script);

    this.setState({
      activeNavigationUrl: item.data.url,
      storyItems: [],
      title: item.data.display_name
    });
  }
});
