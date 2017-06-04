/**
 * @file    filter.js
 * @author  lengchao
 * @version
 * @date    2016-05-14
 */

"use strict";

var app = angular.module( "ico" );

/**
 * format chapter number.
 */
app.filter( "formatChapterNumberFilter" , function() {

    return function( chapterNumber ) {

        var formatter = "第{chapterNumber}章";

        return formatter.replace( "{chapterNumber}" , chapterNumber );
    };
} );
