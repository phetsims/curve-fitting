// Copyright 2002-2014, University of Colorado Boulder

/**
 * Fit maker.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function() {
  'use strict';

  /**
   * @param {number} maxOrderOfFit - Max order of fit.
   * @constructor
   */
  function FitMaker( maxOrderOfFit ) {
    // set max size of matrix
    this.maxM = maxOrderOfFit + 1;
    this.m = null;

    // create solution array
    this.solutionArr = [];

    // create matrix for further computing
    this.matrix = [];
    for ( var i = 0; i < this.maxM; i++ ) {
      this.matrix[ i ] = [];
    }
  }

  FitMaker.prototype = {
    getFit: function( arrPoints, orderOfFit ) {
      this.makeAugmentedMatrix( arrPoints, orderOfFit );
      this.reduceMatrix();
      this.solveReducedMatrix();
      return this.solutionArr;
    },
    makeAugmentedMatrix: function( arrPoints, orderOfFit ) {
      var numberOfPoints = arrPoints.length;
      this.m = Math.min( orderOfFit + 1, numberOfPoints );

      this.zeroMatrix();

      for ( var i = 0; i < numberOfPoints; ++i ) {
        var delta = arrPoints[ i ].delta;
        var deltaSquared = delta * delta;
        var xPos = arrPoints[ i ].x;
        var yPos = arrPoints[ i ].y;
        for ( var j = 0; j < this.m; ++j ) {
          for ( var k = 0; k < this.m; ++k ) {
            this.matrix[ j ][ k ] = this.matrix[ j ][ k ] + Math.pow( xPos, j + k ) / deltaSquared;
          }
          this.matrix[ j ][ this.m ] = this.matrix[ j ][ this.m ] + Math.pow( xPos, j ) * yPos / deltaSquared;
        }
      }
    },
    reduceMatrix: function() {
      for ( var i = 0; i < this.m - 1; ++i ) {
        for ( var j = i + 1; j < this.m; ++j ) {
          var l = this.matrix[ j ][ i ] / this.matrix[ i ][ i ];
          for ( var k = 0; k < this.m + 1; ++k ) {
            this.matrix[ j ][ k ] = this.matrix[ j ][ k ] - l * this.matrix[ i ][ k ];
          }
        }
      }
      this.solveReducedMatrix();
    },
    solveReducedMatrix: function() {
      var m = this.m;
      for ( var i = m - 1; i >= 0; --i ) {
        this.matrix[ i ][ m ] = this.matrix[ i ][ m ] / this.matrix[ i ][ i ];
        this.matrix[ i ][ i ] = 1;
        this.solutionArr[ i ] = this.matrix[ i ][ m ];
        for ( var j = 0; j < i; ++j ) {
          this.matrix[ j ][ m ] = this.matrix[ j ][ m ] - this.matrix[ j ][ i ] * this.solutionArr[ i ];
          this.matrix[ j ][ i ] = 0;
        }
      }
      for ( var k = m; k < this.maxM; ++k ) {
        this.solutionArr[ k ] = 0;
      }
    },
    zeroMatrix: function() {
      for ( var i = 0; i < this.maxM; ++i ) {
        for ( var j = 0; j < this.maxM + 1; ++j ) {
          this.matrix[ i ][ j ] = 0;
        }
      }
    }
  };

  return FitMaker;
} );