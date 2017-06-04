/**
 * @file: directive.js
 * @author: lengchao
 * @version:
 * @date 2016-05-06
 */

"use strict";

var app = angular.module( "ico" );

/**
 * Traverse the tutorial data.
 */
app.directive('filterCourseList', function(){
  return {
     "scope":{
      courseList:'=',
      orderText:'=?', // optional string used for order by
     },
     "restrict"   : "E",
     "templateUrl": "views/template/filter-course-list.html",
     "link" : function(scope){
      scope.showCourseDetail = function(course) {
        course.showDetail = !course.showDetail;
      };
      scope.businessToString = function (businesses){
        console.log(businesses)
        return businesses.map(function(ele){return ele.name;}).toString();
      };
    }
  }
}); 



