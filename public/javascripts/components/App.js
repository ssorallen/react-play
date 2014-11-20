/* Hand compiled (if there is such a thing) by pasting the original JSX file
 * into http://facebook.github.io/react/jsx-compiler.html
 *
 * JSX source: https://github.com/ssorallen/react-reddit-client/blob/master/react-reddit-client.js
 */

var NavigationItem = React.createClass({displayName: 'NavigationItem',
  onClick: function() {
    this.props.itemSelected(this.props.item);
  },
  render: function() {
    return (
      React.createElement("li", {onClick: this.onClick, className: this.props.selected ? "selected" : ""}, 
        this.props.item.data.display_name
      )
    );
  }
});

var Navigation = React.createClass({displayName: 'Navigation',
  itemSelected: function(item) {
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
          React.createElement(NavigationItem, {
            item: item, 
            itemSelected: this.itemSelected, 
            key: item.data.id, 
            selected: item.data.url === this.props.activeUrl})
        );
      }, this);

    return (
      React.createElement("div", {className: "navigation"}, 
        React.createElement("div", {className: "header"}, "Navigation"), 
        React.createElement("ul", null, 
            items
        )
      )
    );
  }
});

var StoryList = React.createClass({displayName: 'StoryList',
  render: function() {
    var storyNodes = this.props.items.map(function(item) {
      return (
        React.createElement("tr", null, 
          React.createElement("td", null, 
            React.createElement("p", {className: "score"}, item.data.score)
          ), 
          React.createElement("td", null, 
            React.createElement("p", {className: "title"}, 
              React.createElement("a", {href: item.data.url}, 
                item.data.title
              )
            ), 
            React.createElement("p", {className: "author"}, 
              "Posted by ", React.createElement("b", null, item.data.author)
            )
          )
        )
      );
    });

    return (
      React.createElement("table", null, 
        React.createElement("tbody", null, 
          storyNodes
        )
      )
    );
  }
});

var App = React.createClass({displayName: 'App',
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
      React.createElement("div", null, 
        React.createElement("h1", null, this.state.title), 
        React.createElement(Navigation, {
          activeUrl: this.state.activeNavigationUrl, 
          items: this.state.navigationItems, 
          itemSelected: this.setSelectedItem}), 
        React.createElement(StoryList, {items: this.state.storyItems})
      )
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
