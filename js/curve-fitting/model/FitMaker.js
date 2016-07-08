// Copyright 2015, University of Colorado Boulder

/**
 * Fit maker for 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';

  // modules
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );
  var CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * @constructor
   */
  function FitMaker() {
    // set max size of matrix
    this.maxM = CurveFittingConstants.MAX_ORDER_OF_FIT + 1;
    this.m = null;

    // create solution array
    this.solutionArr = [];

    // create matrix for further computing
    this.matrix = [];
    for ( var i = 0; i < this.maxM; i++ ) {
      this.matrix[ i ] = [];
    }
  }

  curveFitting.register( 'FitMaker', FitMaker );

  return inherit( Object, FitMaker, {
    /**
     *
     * @param {Array.<Point>} arrPoints
     * @param {number} orderOfFit
     * @returns {Array}
     */
    getFit: function( arrPoints, orderOfFit ) {
      this.makeAugmentedMatrix( arrPoints, orderOfFit );
      this.reduceMatrix();
      this.solveReducedMatrix();
      return this.solutionArr;
    },
    /**
     * @private
     * @param {Array.<Point>} arrPoints
     * @param {number} orderOfFit
     */
    makeAugmentedMatrix: function( arrPoints, orderOfFit ) {
      var numberOfPoints = arrPoints.length;
      this.m = Math.min( orderOfFit + 1, numberOfPoints );

      this.zeroMatrix();

      for ( var i = 0; i < numberOfPoints; ++i ) {
        var delta = arrPoints[ i ].delta;
        var deltaSquared = delta * delta;
        var xPos = arrPoints[ i ].position.x;
        var yPos = arrPoints[ i ].position.y;
        for ( var j = 0; j < this.m; ++j ) {
          for ( var k = 0; k < this.m; ++k ) {
            this.matrix[ j ][ k ] = this.matrix[ j ][ k ] + Math.pow( xPos, j + k ) / deltaSquared;
          }
          this.matrix[ j ][ this.m ] = this.matrix[ j ][ this.m ] + Math.pow( xPos, j ) * yPos / deltaSquared;
        }
      }
    },
    /**
     *  @private
     */
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
    /**
     * @private
     */
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
    /**
     * @private
     */
    zeroMatrix: function() {
      for ( var i = 0; i < this.maxM; ++i ) {
        for ( var j = 0; j < this.maxM + 1; ++j ) {
          this.matrix[ i ][ j ] = 0;
        }
      }
    }
  } );
} );