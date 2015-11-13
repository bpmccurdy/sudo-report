//curl -X GET -H "Authorization: Bearer 7cs4m24vzic2zl1phvg036ucz" https://i-06f25fdf.workdaysuv.com/ccx/internalapi/reporting/v1/super/dataSource/ | python -m json.tool > file.json

function truncate(str, limit) { var bits, i; if ("string" !== typeof str) { return ''; } bits = str.split(''); if (bits.length > limit) { for (i = bits.length - 1; i > -1; --i) { if (i > limit) { bits.length = i; } else if (' ' === bits[i]) { bits.length = i; break; } } bits.push('...'); } return bits.join(''); }

var xxx;

var margin = {top: 5, right: 120, bottom: 20, left: 250},
width = 1150 - margin.right - margin.left,
height = 700 - margin.top - margin.bottom;

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
      //console.log(data);
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

  function loadBusinessObject(businessObjectWID) {
    $.ajax({
      type: "GET",
      url: "https://i-06f25fdf.workdaysuv.com/ccx/internalapi/reporting/v1/super/businessObject/" + businessObjectWID,
      dataType: 'json',
      async: true,
      headers: {
        "Authorization": "Bearer 7cs4m24vzic2zl1phvg036ucz"
      },
      success: function (levela){
        levela.name = levela.descriptor;
        levela.children = levela.classReportFields;
        var reqs = [];
        $.each(levela.children, function (index, levelb) {
          levelb.name = truncate(levelb.descriptor, 27);
          if (levelb.relatedBusinessObject && levelb._children == null && levelb.children == null) {
            console.log("https://i-06f25fdf.workdaysuv.com/ccx/internalapi/reporting/v1/super/businessObject/" + levelb.relatedBusinessObject.id);
            reqs.push($.ajax({
              type: "GET",
              url: "https://i-06f25fdf.workdaysuv.com/ccx/internalapi/reporting/v1/super/businessObject/" + levelb.relatedBusinessObject.id,
              dataType: 'json',
              async: true,
              headers: {
                "Authorization": "Bearer 7cs4m24vzic2zl1phvg036ucz"
              },
              success: function (levelc){
                levelb.children = levelc.classReportFields;
                $.each(levelb.children, function (index, leveld) {
                  leveld.name = leveld.descriptor;
                });
              }, error: function (e){
                console.log(e);
              }
            }));
          }
        });

        $.when.apply($,reqs).always(function(){
          console.log("DONE");
          root = levela;
          console.log(root);
  //         root = {
  //  "name": "analytics",
  //  "children": [
  //   {
  //    "name": "cluster",
  //    "children": [
  //     {"name": "AgglomerativeCluster", "size": 3938},
  //     {"name": "CommunityStructure", "size": 3812},
  //     {"name": "HierarchicalCluster", "size": 6714},
  //     {"name": "MergeEdge", "size": 743}
  //    ]
  //   },
  //   {
  //    "name": "graph",
  //    "children": [
  //     {"name": "BetweennessCentrality", "size": 3534},
  //     {"name": "LinkDistance", "size": 5731},
  //     {"name": "MaxFlowMinCut", "size": 7840},
  //     {"name": "ShortestPaths", "size": 5914},
  //     {"name": "SpanningTree", "size": 3416}
  //    ]
  //   },
  //   {
  //    "name": "optimization",
  //    "children": [
  //     {"name": "AspectRatioBanker", "size": 7074}
  //    ]
  //   }
  //  ]
  // };




          xxx = root;
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
      }
    });
  }

  var duration = 750, i = 0,
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

//d3.select(self.frameElement).style("height", "400px");

// function update(source) {

//   // Compute the new tree layout.
//   var nodes = tree.nodes(root).reverse(),
//   links = tree.links(nodes);

//   // Normalize for fixed-depth.
//   nodes.forEach(function(d) { d.y = d.depth * 180; });

//   // Update the nodes…
//   var node = svg.selectAll("g.node")
//   .data(nodes, function(d) { return d.id || (d.id = ++i); });

//   // Enter any new nodes at the parent's previous position.
//   var nodeEnter = node.enter().append("g")
//   .attr("class", "node")
//   .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
//   .on("click", click);

//   nodeEnter.append("circle")
//   .attr("r", 1e-6)
//   .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

//   nodeEnter.append("text")
//   .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
//   .attr("dy", ".35em")
//   .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
//   .text(function(d) { return d.name; })
//   .style("fill-opacity", 1e-6).style("font-size", "15px");

//   // Transition nodes to their new position.
//   var nodeUpdate = node.transition()
//   .duration(duration)
//   .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

//   nodeUpdate.select("circle")
//   .attr("r", 4.5)
//   .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

//   nodeUpdate.select("text")
//   .style("fill-opacity", 1);

//   // Transition exiting nodes to the parent's new position.
//   var nodeExit = node.exit().transition()
//   .duration(duration)
//   .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
//   .remove();

//   nodeExit.select("circle")
//   .attr("r", 1e-6);

//   nodeExit.select("text")
//   .style("fill-opacity", 1e-6);

//   // Update the links…
//   var link = svg.selectAll("path.link")
//   .data(links, function(d) { return d.target.id; });

//   // Enter any new links at the parent's previous position.
//   link.enter().insert("path", "g")
//   .attr("class", "link")
//   .attr("d", function(d) {
//     var o = {x: source.x0, y: source.y0};
//     return diagonal({source: o, target: o});
//   });

//   // Transition links to their new position.
//   link.transition()
//   .duration(duration)
//   .attr("d", diagonal);

//   // Transition exiting nodes to the parent's new position.
//   link.exit().transition()
//   .duration(duration)
//   .attr("d", function(d) {
//     var o = {x: source.x, y: source.y};
//     return diagonal({source: o, target: o});
//   })
//   .remove();

//   // Stash the old positions for transition.
//   nodes.forEach(function(d) {
//     d.x0 = d.x;
//     d.y0 = d.y;
//   });
// }


  function update(source) {

    // Compute the new tree layout.
    var nodes = tree.nodes(root).reverse(),
    links = tree.links(nodes);

    // Normalize for fixed-depth.
    nodes.forEach(function(d) { d.y = d.depth * 180; });

    // Update the nodes…
    var node = svg.selectAll("g.node")
    .data(nodes, function(d) { return d.KEY || (d.KEY = ++i); });

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
    .style("fill-opacity", 1e-6);

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
    .data(links, function(d) { return d.target.KEY; });

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
    }  else {
      d.children = d._children;
      d._children = null;
    }
    update(d);
  }

});






