// Copyright 2017, University of Colorado Boulder

/**
 * Model of the shape of a polynomial curve.
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );
  var CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Shape = require( 'KITE/Shape' );
  var Util = require( 'DOT/Util' );

  /**
   * @param {Function} getYValueAt - get the Y value at the x coordinate
   * @param {number[]} coefficients - coefficients of polynomial
   * @param {number} order - order of the polynomial that describes the curve
   * @param {Object} [options]
   * @constructor
   */
  function CurveShape( getYValueAt, coefficients, order, options ) {

    options = _.extend( {
      debug: false
    }, options );

    Shape.call( this );

    // @private
    this.getYValueAt = getYValueAt;

    // model bounds of the graph area
    var graphBounds = CurveFittingConstants.GRAPH_MODEL_BOUNDS;

    // convenience variables
    var xMin = graphBounds.minX; // minimum value of the x range
    var xMax = graphBounds.maxX; // maximum value of the x range

    // curve is a line, quadratic or cubic depending on the order of the fit.
    switch( order ) {
      case 3: //cubic
        var xCubicCoordinates = this.findSpecialXCoordinates( coefficients, order );
        // add cubic Bezier segments between each xCoordinates
        this.addSegments( this.addCubic.bind( this ), xCubicCoordinates );
        break;
      case 2 : // quadratic
        var xQuadraticCoordinates = this.findSpecialXCoordinates( coefficients, order );
        // add quadratic Bezier segments between each xQuadraticCoordinates
        this.addSegments( this.addQuadratic.bind( this ), xQuadraticCoordinates );
        break;
      default: // linear
        this.addLinear( xMin, xMax );
        break;
    } // end of switch statement

    // slow but failsafe method: plot curve as a series of small linear segments
    if ( options.debug ) {
      // invalidate shape
      this.shape = {};
      // add many segments
      var steps = 1000;
      // separation between adjacent x coordinates
      var interval = ( xMax - xMin ) / steps;
      // array of x coordinates
      var xCoordinates = _.range( xMin, xMax, interval );
      // add linear segments
      this.addSegments( this.addLinear.bind( this ), xCoordinates );
    }
  }

  curveFitting.register( 'CurveShape', CurveShape );

  return inherit( Shape, CurveShape, {
    /**
     * gets the shape of the curve
     * @returns {Shape}
     * @public (read-only)
     */
    getShape: function() {
      return this;
    },
    /**
     * adds a linear segment shape between x position start and x position end
     * @param {number} start
     * @param {number} end
     * @returns {Shape}
     * @private
     */
    addLinear: function( start, end ) {

      var yStart = this.getYValueAt( start );
      var yEnd = this.getYValueAt( end );
      this.moveTo( start, yStart ).lineTo( end, yEnd );
      return this;  // for chaining
    },
    /**
     * adds a quadratic segment shape between x position start and x position end
     * @param {number} start
     * @param {number} end
     * @returns {Shape}
     * @private
     */
    addQuadratic: function( start, end ) {

      // x coordinate of the control point
      var cpx = ( start + end ) / 2; // point halfway between start and end

      var yAtStart = this.getYValueAt( start );
      var yAtEnd = this.getYValueAt( end );
      var yAtCpx = this.getYValueAt( cpx );

      // the value of cpy, the y value of the control point, is not the value of yAtCpx but is related to it by the equation
      var cpy = ( -yAtStart + 4 * yAtCpx - yAtEnd ) / 2;

      this.moveTo( start, yAtStart ).quadraticCurveTo( cpx, cpy, end, yAtEnd );
      return this;  // for chaining
    },
    /**
     * adds a cubic segment shape between x position start and x position end
     * @param {number} start
     * @param {number} end
     * @returns {Shape}
     * @private
     */
    addCubic: function( start, end ) {

      // x coordinate of the control points
      var cp1x = ( 2 * start + end ) / 3; // one third of the way between start and end
      var cp2x = ( start + 2 * end ) / 3; // two third of the way between start and end

      var yAtStart = this.getYValueAt( start );
      var yAtEnd = this.getYValueAt( end );
      var yAtCp1x = this.getYValueAt( cp1x );
      var yAtCp2x = this.getYValueAt( cp2x );

      // the control points cp1y and cp2y are not given by the values at yAtCp1x and yAtCp2x, but are related tp them through the equations
      var cp1y = ( -5 * yAtStart + 18 * yAtCp1x - 9 * yAtCp2x + 2 * yAtEnd ) / 6;
      var cp2y = ( +2 * yAtStart - 9 * yAtCp1x + 18 * yAtCp2x - 5 * yAtEnd ) / 6;

      this.moveTo( start, yAtStart ).cubicCurveTo( cp1x, cp1y, cp2x, cp2y, end, yAtEnd );
      return this; // for chaining
    },
    /**
     * adds segments shape between the x positions of the xCoordinates array
     * @param {Function} addSegment
     * @param {number[]} xCoordinates
     * @private
     */
    addSegments: function( addSegment, xCoordinates ) {
      var length = xCoordinates.length;
      for ( var i = 1; i < length; i++ ) {
        addSegment( xCoordinates[ i - 1 ], xCoordinates[ i ] );
      }
    },

    /**
     * Returns the x coordinates of the polynomial curve that intersect the bounds of the graphs as well as the zeros of the curve.
     * The xCoordinates can be used to design a more robust plotting algorithm for the polynomial curve.
     * @param {number[]} coefficients
     * @param {number} order - an integer indicated the order of the polynomial
     * @returns {number[]} xCoordinates - a sorted array of xCoordinates within the horizontal GRAPH_MODEL_BOUNDS
     * @private
     */
    findSpecialXCoordinates: function( coefficients, order ) {

      assert && assert( order === 2 || order === 3, 'order must be 2 or 3, order is :' + order );

      // an array of coefficients. Recall that the coefficients are sorted from lowest to highest order of polynomial.
      var coef = coefficients;

      // model bounds of the graph area
      var graphBounds = CurveFittingConstants.GRAPH_MODEL_BOUNDS;

      // convenience variables
      var xMin = graphBounds.minX; // minimum value of the x range
      var xMax = graphBounds.maxX; // maximum value of the x range
      var yMin = graphBounds.minY; // minimum value of the y range
      var yMax = graphBounds.maxY; // maximum value of the y range

      // this method will return an array called xCoordinates
      // include in xCoordinates the minimum and maximum value of the x range.
      var xCoordinates = [ xMin, xMax ];

      if ( order === 3 ) {
        // find the real solutions to  Y(x)=0, i.e. the zeros of the cubic polynomial
        // Util.solveCubicRootsReal wants the coefficients in reversed order
        var zeroXCubicSolutions = Util.solveCubicRootsReal( coef[ 3 ], coef[ 2 ], coef[ 1 ], coef[ 0 ] );

        // find the real solutions to  Y(x)=  yMin, i.e. when the curve intersects the bottom axis
        var bottomXCubicSolutions = Util.solveCubicRootsReal( coef[ 3 ], coef[ 2 ], coef[ 1 ], coef[ 0 ] - yMin );

        // find the real solutions to  Y(x)= yMax, i.e. when the curve intersects the top axis
        var topXCubicSolutions = Util.solveCubicRootsReal( coef[ 3 ], coef[ 2 ], coef[ 1 ], coef[ 0 ] - yMax );

        // concatenate all coordinates in a single array
        xCoordinates = xCoordinates.concat( zeroXCubicSolutions, bottomXCubicSolutions, topXCubicSolutions );
      }
      else if ( order === 2 ) {
        // find the real solutions to quadratic polynomial  Y(x)=0, i.e. the zeros of the quadratic curve
        var zeroXQuadraticSolutions = Util.solveQuadraticRootsReal( coef[ 2 ], coef[ 1 ], coef[ 0 ] );

        // find the real solutions to  Y(x)=  yMin, i.e. when the curve intersects the bottom axis
        var bottomXQuadraticSolutions = Util.solveQuadraticRootsReal( coef[ 2 ], coef[ 1 ], coef[ 0 ] - yMin );

        // find the real solutions to  Y(x)= yMax, i.e. when the curve intersects the top axis
        var topXQuadraticSolutions = Util.solveQuadraticRootsReal( coef[ 2 ], coef[ 1 ], coef[ 0 ] - yMax );

        xCoordinates = xCoordinates.concat( zeroXQuadraticSolutions, bottomXQuadraticSolutions, topXQuadraticSolutions );
      }

      // removing null values if present (see https://github.com/phetsims/curve-fitting/issues/113)
      xCoordinates = xCoordinates.filter( x => x !== null );

      // filter the xCoordinates to include only coordinates between xMin and xMax
      xCoordinates = xCoordinates.filter( function isWithinRange( xValue ) {
        return xValue >= xMin && xValue <= xMax;
      } );

      // sort the coordinates in numerical order
      xCoordinates = xCoordinates.sort( function compare( a, b ) { return a - b;} );

      // removing duplicates on the sorted array;
      xCoordinates = _.uniq( xCoordinates, true );

      return xCoordinates;
    }
  } );
} );