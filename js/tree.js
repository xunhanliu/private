/**
 * Created by Administrator on 2018/7/17.
 */
var lastSearchResult=[];
$("#btn_search").click(function(){
    if($("#search").val()=="")
    {
        alert("请在搜索框内输入姓名！");
        lastSearchResult=[];
        return;
    }
    else{
        var searchResult=[];
        for(i in treeData){
            searchTree(i,treeData[i],$("#search").val(),searchResult);
        }
        lastSearchResult=searchResult;
        //append 搜索结果的div
        $("#searchResult a").remove();
        if(lastSearchResult.length>0){
            d3.select("#searchResult").selectAll("a")
                .data(lastSearchResult)
                .enter().append("a").attr("class","btn btn-default").text(function(d){
                return "树"+d.index+"  :"+d.node.name+","+d.node.wifeName;
            }).on("click",searchResultClick);

        }
        else{
            alert("未搜索到相关人员！");
        }
    }
});
//appeng lastSearchResult
$("#search").mouseenter(function(){
    if(lastSearchResult.length>0 && $("#searchResult a").length==0){
       d3.select("#searchResult").selectAll("a")
            .data(lastSearchResult)
            .enter().append("a").attr("class","btn btn-default").text(function(d){
                return "树"+d.index+"  :"+d.node.name+","+d.node.wifeName;
       }).on("click",searchResultClick);

    }
});
var focusNode={};

function searchResultClick(d){
    //drawWhichTree(d.index);
    update(treeData[d.index]);
    focusNode=d.node;
    setTimeout("centerNode(focusNode)",100);
}
//remove div
$("#searchResult").mouseleave(function(){
    $("#searchResult a").remove();
});
function searchTree(index,root1,searchName,result)
{
    if(root1.name==searchName|| root1.wifeName==searchName)
        result.push({"index":index,"node":root1});
    for(i in root1.children)
    {
        searchTree(index,root1.children[i],searchName,result)
    }
}


var api = {
        'tree': 'data/tree.json'
    };

//http://pba2eisyn.bkt.clouddn.com/image/pic/name.jpg

/* d3.layout.tree */
var margin = {top: 20, right: 20, bottom: 20, left: 20},
   // width = $('#chart').parent().width()-$(".sidebar").width(),
    //height = 1900 - margin.top - margin.bottom, // 1900
    //height = $(window).height()-$("#header").height()-$("#footer").height() -58,
   // height = $(window).height()-58,
    width=$("#chart").width(),
    height=$("#chart").height(),
    eachTreeHight=100,
    //height = 1500;
    // _height = 100,
    // min_height = 25,
    // max_height = 100;

i = 0,
    duration = 750,
    rootOrig = {},
    root = {};


var img_width = 50,
    img_height = 50,
    imgInterval=0;

// var tree = d3.layout.tree()
//     //.size([height, width])
//     .nodeSize([img_height+15,img_width*2+imgInterval]
//     );
var tree = d3.layout.tree()
    .nodeSize([img_width*2+imgInterval+10,img_height+15])

;

var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.x, d.y]; });

var svgGroup = d3.select("#chart").append("svg")
    .attr("width", width+ margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("id", "svgWrapper")
    .append("g")
    .attr("id", "svg")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ") scale(0.9)");
/* d3.layout.tree */
var dataMap={};
var treeData = [];
function range(start, stop, step)
{
    if (typeof(stop) == 'undefined')
    {
        // one param defined
        stop = start;
        start = 0;
    }
    if (typeof(step) == 'undefined')
    {
        step = 1;
    }
    if ((step > 0 && start >= stop) || (step < 0 && start <= stop))
    {
        return [];
    }
    var result = [];
    for (var i = start; step > 0 ? i < stop : i > stop; i += step)
    {
        result.push(i);
    }
    return result;
}
function renderTreeData(){
    var request = $.ajax({
        url : api.tree,
        type : 'GET',
        data : {},
        async: false,
        dataType : 'json'
    });

    request.done(function(json){
        if (json.success) {
            var data = json.data;
            rootOrig = data,
                dataArr = [];

            for (var prop in data) {
                dataArr.push(data[prop]);
            }
            //dataArr 就是一个数组

                dataMap = dataArr.reduce(function(map, node) {
                    map[node.id] = node;
                    return map;
                }, {});

            dataArr.forEach(function(node) {
                // add to parent
                var parent = dataMap[node.parent];
                if (parent) {
                    // create child array if it doesn't exist
                    (parent.children || (parent.children = []))
                    // add node to child array
                        .push(node);
                } else {
                    // parent is null or missing
                    treeData.push(node);
                }
            });
//treeData是最终的处理结果
            //默认绘制第0棵树
            d3.select("#treeSel").selectAll("option").remove();
            d3.select("#treeSel").selectAll("option")
                .data(range(0,treeData.length,1))
                .enter().append("option").text(function(d){
                    return d;
            });
            $("#treeSel").change(function () {
                drawWhichTree($("#treeSel").val());
            });
            drawWhichTree(0);
        } else {

        }
    });
}
function drawWhichTree(index){
    root=treeData[index];
    root.x0 = 300;
    root.y0 = 0;
    update(root);
    resizeLayout();
    setTimeout("centerNode(root)",50);
}
function update(source) {

    // Compute the new tree layout.
    var nodes = tree.nodes(root).reverse(),
        links = tree.links(nodes);

    // Normalize for fixed-depth.
    nodes.forEach(function(d) { d.y = d.depth * eachTreeHight; });

    // Update the nodes…
    var node = svgGroup.selectAll("g.node")
        .data(nodes, function(d) {return d.id });

    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
        .attr("id", function(d){
            return "node" + d.id;
        });
    var nodeHotMan = nodeEnter.append("svg:a")  //<a href="#modal-container" role="button" class="btn" data-toggle="modal">触发遮罩窗体</a>
        .attr("xlink:href", function(d){
            if(d.homepage!="") {
                d3.select(this).attr("target", "_blank")
                return d.homepage;
            }
            else{
                d3.select(this).attr("role","button")
                    .attr("data-toggle","modal");
                return  "#modal-container";
            }
        })
        .attr("role","button")
        .attr("data-toggle","modal")
        // .attr("target", function(d){
        //     var target = "_blank"; //"_blank"  "_self"
        //     return target;
        //
        // })
    ;
    var nodeHotWoman = nodeEnter.append("svg:a")  //<a href="#modal-container" role="button" class="btn" data-toggle="modal">触发遮罩窗体</a>
            .attr("xlink:href", function(d){
                if(d.wifeHomepage!="") {
                    d3.select(this).attr("target", "_blank")
                    return d.wifeHomepage;
                }
                else {
                    d3.select(this).attr("role","button")
                        .attr("data-toggle","modal");
                    return "#modal-container";
                }

            })
        // .attr("target", function(d){
        //     var target = "_blank"; //"_blank"  "_self"
        //     return target;
        //
        // })
    ;
    nodeEnter.append("svg:image")
        .attr("xlink:href", function(d){
            //return getPicture(d);
            //return "http://pba2eisyn.bkt.clouddn.com/image/pic/%E5%90%8D%E5%AD%97.jpg"
            d3.select(this).attr("xlink:href",d.headURL);

        })
        .attr("class", "man")
        .attr('width', function(d){
            return img_width;
        })
        .attr("stroke","#000")
        .attr('height', function(d){
            return img_height;
        })
        .attr('x', function(d){
            if(d.wifeName=="")
            {
                return -img_width/2;
            }
            else {
                return -img_width-imgInterval/2;
            }
        })
        .attr('y', function(d){
            return -img_height/2;
        })
        .style('cursor', function(d){ return d.children || d._children ?"pointer":"default" })
        .on("click", collapsingClick)
        .on("error",function(d){
            if(d.sex=="男"){
                d3.select(this).attr("xlink:href", "http://pc0d0tk9k.bkt.clouddn.com/man.jpg");}
            else{
                d3.select(this).attr("xlink:href", "http://pc0d0tk9k.bkt.clouddn.com/woman.jpg");
            }
            return ;
        })
    ;


    nodeHotMan.append("text")
        //.attr("x", function(d) { return d.children || d._children ? -20 : 20; })
        .attr("class", "manName")
        .attr('x', function(d){
            if(d.wifeName=="")
            {
                return 0;
            }
            else return (-img_width-imgInterval)/2;
        })
        .attr("y", function(d) { return img_height/2+ 5 ; })
        .attr("dy", ".3em")
        .attr("text-anchor", function(d) { return "middle" ; })
        .text(function(d) {
            return d.name;
        })
        .style("fill-opacity", 1e-6)
        .on("click", click)
    ;

    nodeEnter.append("svg:image")
            .attr("xlink:href", function(d){
                //return getPicture(d);
                //return "http://pba2eisyn.bkt.clouddn.com/image/pic/%E5%90%8D%E5%AD%97.jpg"
                d3.select(this).attr("xlink:href",d.wifeHeadURL);
                if(d.wifeName==""){
                    d3.select(this).attr('style', function (d){
                        return 'width:0; height:0; class:none;'
                    });
                }
                else{
                    d3.select(this).attr('width', img_width)
                        .attr('height', img_height)
                        .attr("class", "woman")
                }

            })
            .attr('x',  imgInterval/2)
            .attr('y',  -img_height/2)
            .style('cursor', function(d){ return d.children || d._children ?"pointer":"default" })
            .on("click", collapsingClick)
            .on("error",function(d){
                d3.select(this).attr("xlink:href", "http://pc0d0tk9k.bkt.clouddn.com/woman.jpg");
                return ;
            })
        ;


    nodeHotWoman.append("text")
        //.attr("x", function(d) { return d.children || d._children ? -20 : 20; })
            .attr('x', (img_width+imgInterval)/2)
            .attr("y",  img_height/2+ 5 )
            .attr("dy", ".35em")
            .attr("text-anchor", function(d) { return "middle" ; })
            .text(function(d) {
                if(d.wifeName==""){
                    return "";
                }
                else
                return d.wifeName;
            })
            .style("fill-opacity", 1e-6)
            .on("click", click)
    ;


    // Transition nodes to their new position.
    var nodeUpdate = node.transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

    nodeUpdate.select(".man")
        .attr("xlink:href", function(d){
           // return getPicture(d);
            return d.headURL;
        })
        ;
    nodeUpdate.select(".woman")
        .attr("xlink:href", function(d){
            // return getPicture(d);
            return d.wifeHeadURL;
        })
        .style('cursor', function(d){ return d.children || d._children ?"pointer":"default" });


    nodeUpdate.selectAll("text")
        .style("fill-opacity", 1);

    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + source.x + "," + source.y + ")"; })
        .remove();

    nodeExit.select("text")
        .style("fill-opacity", 1e-6);

    // Update the links…
    var link = svgGroup.selectAll("path.link")
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
        .attr('style', function (d){
            //     return 'fill:none; stroke:#f3dcdd; stroke-width:2px;'
            return 'fill:none; stroke:#999; stroke-width:2px;'

        })
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
    // update(d);
    // resizeLayout();
    centerNode(d);
    //$("#modal_pic").attr('src',"http://adrln.com/wp-content/uploads/2016/04/SIZE-CHART-2016-1-524x1024.jpg");
    $("#modal_pic").attr('src',d.headURL);
    $("#modal_name").text("姓名："+d.name);
    $("#modal_father").text("父亲："+d.parent.name);
    $("#modal_content").html(d.content);




}
function collapsingClick(d){
    if (d.children) {
        d._children = d.children;
        d.children = null;
    } else {
        d.children = d._children;
        d._children = null;
    }
    update(d);
    resizeLayout();
    centerNode(d);
}
// function computeDistance(_tree) {
//
//     if ( _tree.children ) {
//         var _children = _tree.children,
//             length = _children.length;
//
//         for ( var i=0; i<length; ++i ) {
//             if ( i<length-1 ) {
//                 if ( Math.abs(_children[i].x0-_children[i+1].x0)<_height ) {
//
//                     _height = Math.ceil(Math.abs(_children[i].x0-_children[i+1].x0));
//                 }
//             }
//
//             computeDistance(_children[i]);
//         }
//     }
// }

function resizeLayout(){  //会调整每层的宽度
    // _height = 1000;
    //
    // computeDistance(root);
    //
    // if ( _height<min_height ) {
    //     var scale = min_height / _height,
    //         new_height = d3.select('#svgWrapper').attr('height')*scale;
    //
    //     var _size = tree.size();
    //     tree.size([_size[0]*scale, _size[1]]);
    //
    //     update(root);
    //
    // } else if ( _height>max_height && root.children ) {
    //     var scale = max_height / _height,
    //         new_height = d3.select('#svgWrapper').attr('height')*scale;
    //
    //
    //     if ( new_height < 700 ) {
    //         new_height = 700;
    //     }
    //
    //     var _size = tree.size();
    //     tree.size([_size[0]*scale, _size[1]]);
    //
    //     update(root);
    // }
}



/**
 @description calculate the string length
 */
function getLength(str){

    if (str) {
        return str.replace(/[\u4E00-\u9FA5]|[^\x00-\xff]/ig, "cc").replace(/[A-Z]/g, 'cc').length;
    }

    return 0;
}
var zoomListener={};

function centerNode(source) {
    scale = zoomListener.scale();
    y = -source.y0;
    x = -source.x0;
    x = x * scale + width / 2;
    y = y * scale + height / 2;
    d3.select('g').transition()
        .duration(duration)
        .attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")");
    zoomListener.scale(scale);
    zoomListener.translate([x, y]);
}
$(function(){
    renderTreeData();
    zoomListener=d3.behavior.zoom().scaleExtent([0.5, 3]).on("zoom", function(){
        svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");


    });
    d3.select('#chart').call(zoomListener).on('dblclick.zoom', null);
    d3.select('#chart').call(d3.behavior.drag());


});

