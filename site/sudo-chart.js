//curl -X GET -H "Authorization: Bearer 7cs4m24vzic2zl1phvg036ucz" https://i-06f25fdf.workdaysuv.com/ccx/internalapi/reporting/v1/super/dataSource/ | python -m json.tool > file.json


var margin = {top: 5, right: 120, bottom: 20, left: 150},
width = 800 - margin.right - margin.left,
height = 600 - margin.top - margin.bottom;

function loadBusinessObject(businessObjectWID) {
  $.ajax({
  type: "GET",
  url: "https://i-06f25fdf.workdaysuv.com/ccx/internalapi/reporting/v1/super/businessObject/",
  dataType: 'json',
  async: true,
  headers: {
    "Authorization": "Bearer 7cs4m24vzic2zl1phvg036ucz"
  },
  success: function (data){
    $.each(data.data, function (data) {
      var d = {
        "wid": data.id,
        "label": data.descriptor,
        "returnClass": data.classOfExternalFieldResult,
        "CRFs": data.relatedBusinessObject
      };

      return d;
    });    
  }
});
}

$(document).ready(function(){
  sudo.storage.start();
$.ajax({
  type: "GET",
  url: "https://i-06f25fdf.workdaysuv.com/ccx/internalapi/reporting/v1/super/dataSource/",
  dataType: 'json',
  async: true,
  headers: {
    "Authorization": "Bearer 7cs4m24vzic2zl1phvg036ucz"
  },
  success: function (data){
    $.each(data.data, function (index, data) {
      var d = {
        "wid": data.id,
        "label": data.descriptor,
        "categories": [],
        "object": data.primaryBusinessObject
      };
      $.each(data.dataSourceCategories || [], function(index, data){
        d.categories.push(data.descriptor);
      });
      sudo.storage.put("s", data.id, d);
    });
  }
});

$("#search").keyup(function () {
  var out = ""
  $.each(sudo.search.query($("#search").val()), function (index, data) {
    console.log(data);
    var item = sudo.storage.get(data.split("$")[0], data.split("$")[1]);
    out += "<li><a id='" + data + "' class='bo' href='#'>" + item.label + "</a></li>";
  });
  $("#source-list").html(out);
  $(".bo").click(function(e){
    var data = $(e.target).attr("id");
    var item = sudo.storage.get(data.split("$")[0], data.split("$")[1]);
    loadBusinessObject(item.object.id)
  });
});

  var duration = 750,i = 0,
  root;


  var tree = d3.layout.tree()
  .size([height, width]);

  var diagonal = d3.svg.diagonal()
  .projection(function(d) { return [d.y, d.x]; });

  var svg = d3.select("#bo-tree").append("svg")
  .attr("width", width + margin.right + margin.left)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  d3.json("sample.json", function(error, flare) {
    if (error) throw error;

    root = flare;
    root.x0 = height / 2;
    root.y0 = 300;

    function collapse(d) {
      if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
      }
    }

    root.children.forEach(collapse);
    update(root);
  });

//d3.select(self.frameElement).style("height", "400px");

function update(source) {

  // Compute the new tree layout.
  var nodes = tree.nodes(root).reverse(),
  links = tree.links(nodes);

  // Normalize for fixed-depth.
  nodes.forEach(function(d) { d.y = d.depth * 250; });

  // Update the nodes…
  var node = svg.selectAll("g.node")
  .data(nodes, function(d) { return d.id || (d.id = ++i); });

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append("g")
  .attr("class", "node")
  .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
  .on("click", click);

  nodeEnter.append("circle")
  .attr("r", 1e-6)
  .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

  nodeEnter.append("text")
  .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
  .attr("dy", ".35em")
  .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
  .text(function(d) { return d.name; })
  .style("fill-opacity", 1e-6).style("font-size", "20px");

  // Transition nodes to their new position.
  var nodeUpdate = node.transition()
  .duration(duration)
  .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

  nodeUpdate.select("circle")
  .attr("r", 4.5)
  .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

  nodeUpdate.select("text")
  .style("fill-opacity", 1);

  // Transition exiting nodes to the parent's new position.
  var nodeExit = node.exit().transition()
  .duration(duration)
  .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
  .remove();

  nodeExit.select("circle")
  .attr("r", 1e-6);

  nodeExit.select("text")
  .style("fill-opacity", 1e-6);

  // Update the links…
  var link = svg.selectAll("path.link")
  .data(links, function(d) { return d.target.id; });

  // Enter any new links at the parent's previous position.
  link.enter().insert("path", "g")
  .attr("class", "link")
  .attr("d", function(d) {
    var o = {x: source.x0, y: source.y0};
    return diagonal({source: o, target: o});
  });

  // Transition links to their new position.
  link.transition()
  .duration(duration)
  .attr("d", diagonal);

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
  .duration(duration)
  .attr("d", function(d) {
    var o = {x: source.x, y: source.y};
    return diagonal({source: o, target: o});
  })
  .remove();

  // Stash the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}

// Toggle children on click.
function click(d) {
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
  update(d);
}


});