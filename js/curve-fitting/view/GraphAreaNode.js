// Copyright 2015-2016, University of Colorado Boulder

//TODO rename, untangle
/**
 * Graph area node in 'Curve Fitting' simulation.
 * Contains graph area and curve with residual lines
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';

  // modules
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );
  var CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );

  // constants
  var AXIS_OPTIONS = {
    lineWidth: 1,
    stroke: 'black'
  };
  var TICK_LENGTH = 7;

  /**
   * @param {Curve} curve - curve model.
   * @param {Property.<boolean>} residualsVisibleProperty
   * @param {Property.<boolean>} curveVisibleProperty
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function GraphAreaNode( curve, residualsVisibleProperty, curveVisibleProperty, modelViewTransform ) {

    Node.call( this );

    // model bounds of the graph
    var graphBounds = CurveFittingConstants.GRAPH_MODEL_BOUNDS;

    // determine the graph are bounds in the view
    var graphViewBounds = modelViewTransform.modelToViewBounds( graphBounds );

    // create and add white background
    this.addChild( new Rectangle.bounds( graphViewBounds, {
      fill: 'white',
      lineWidth: 2,
      stroke: 'rgb( 214, 223, 226 )'
    } ) );

    var axisShape = new Shape();
    this.addChild( new Path( axisShape, AXIS_OPTIONS ) );

    // add X-axis
    axisShape.moveTo( graphViewBounds.minX, graphViewBounds.centerY );
    axisShape.lineTo( graphViewBounds.maxX, graphViewBounds.centerY );

    // add ticks
    axisShape.moveTo( graphViewBounds.minX + AXIS_OPTIONS.lineWidth / 2, graphViewBounds.centerY - TICK_LENGTH );
    axisShape.lineTo( graphViewBounds.minX + AXIS_OPTIONS.lineWidth / 2, graphViewBounds.centerY + TICK_LENGTH );
    axisShape.moveTo( graphViewBounds.minX + graphViewBounds.width / 4, graphViewBounds.centerY - TICK_LENGTH );
    axisShape.lineTo( graphViewBounds.minX + graphViewBounds.width / 4, graphViewBounds.centerY + TICK_LENGTH );
    axisShape.moveTo( graphViewBounds.minX + 3 * graphViewBounds.width / 4, graphViewBounds.centerY - TICK_LENGTH );
    axisShape.lineTo( graphViewBounds.minX + 3 * graphViewBounds.width / 4, graphViewBounds.centerY + TICK_LENGTH );
    axisShape.moveTo( graphViewBounds.maxX - AXIS_OPTIONS.lineWidth / 2, graphViewBounds.centerY - TICK_LENGTH );
    axisShape.lineTo( graphViewBounds.maxX - AXIS_OPTIONS.lineWidth / 2, graphViewBounds.centerY + TICK_LENGTH );

    // add Y-axis and ticks
    axisShape.moveTo( graphViewBounds.centerX, graphViewBounds.minY );
    axisShape.lineTo( graphViewBounds.centerX, graphViewBounds.maxY );

    axisShape.moveTo( graphViewBounds.centerX - TICK_LENGTH, graphViewBounds.minY + AXIS_OPTIONS.lineWidth / 2 );
    axisShape.lineTo( graphViewBounds.centerX + TICK_LENGTH, graphViewBounds.minY + AXIS_OPTIONS.lineWidth / 2 );
    axisShape.moveTo( graphViewBounds.centerX - TICK_LENGTH, graphViewBounds.centerY + graphViewBounds.height / 4 );
    axisShape.lineTo( graphViewBounds.centerX + TICK_LENGTH, graphViewBounds.centerY + graphViewBounds.height / 4 );
    axisShape.moveTo( graphViewBounds.centerX - TICK_LENGTH, graphViewBounds.centerY - graphViewBounds.height / 4 );
    axisShape.lineTo( graphViewBounds.centerX + TICK_LENGTH, graphViewBounds.centerY - graphViewBounds.height / 4 );
    axisShape.moveTo( graphViewBounds.centerX - TICK_LENGTH, graphViewBounds.maxY - AXIS_OPTIONS.lineWidth / 2 );
    axisShape.lineTo( graphViewBounds.centerX + TICK_LENGTH, graphViewBounds.maxY - AXIS_OPTIONS.lineWidth / 2 );

    // add clip area
    this.clipArea = Shape.bounds( graphViewBounds );

    var curvePath = new Path( null, { stroke: 'black', lineWidth: 2 } );
    this.addChild( curvePath );

    var residualsPath = new Path( null, { stroke: CurveFittingConstants.GRAY_COLOR, lineWidth: 2 } );
    this.addChild( residualsPath );

    /**
     * updates the shape of the curve and the residuals
     */
    var updateShape = function() {
      var curveShape = null;
      var residualsShape = null;
      var order = curve.orderProperty.value;
      var points = curve.getPoints();
      var a = curve.a;
      var b = curve.b;
      var c = curve.c;
      var d = curve.d;

      // ensure the order is 1, 2 or 3, linear, quadratic or cubic
      assert && assert( order === 1 || order === 2 || order === 3, 'invalid order: ' + order );

      //TODO This expression looks suspect, or at least overly complicated. Simplify or document.
      //TODO curve.fitProperty is private, should not be assigned here!!
      if ( ( points.length > 1 || curve.fitProperty.value === 'adjustable' ) && !isNaN( a ) && !isNaN( b ) && !isNaN( c ) && !isNaN( d ) ) {

        // convenience variables
        var xMin = graphBounds.minX; // minimum value of the x range
        var xMax = graphBounds.maxX; // maximum value of the x range
        var yAtXMin = curve.getYValueAt( xMin );
        var yAtXMax = curve.getYValueAt( xMax );

        // update curve path
        curveShape = new Shape();
        curveShape.moveTo( xMin, yAtXMin );

        // curve is a line, quadratic or cubic depending on the order of the fit.
        switch( order ) {
          case 3:
            // use bezier curve : must determine the control points
            // note that the curve will not go through the control points.
            var cp1x = (2 * xMin + xMax) / 3; // one third of the way between xMmin and xMax
            var cp2x = (xMin + 2 * xMax) / 3; // two third of the way between xMmin and xMax
            var cp1y = a * xMax * xMin * xMin + b * (xMin + 2 * xMax) * xMin / 3 + c * (2 * xMin + xMax) / 3 + d;
            var cp2y = a * xMin * xMax * xMax + b * (xMax + 2 * xMin) * xMax / 3 + c * (2 * xMax + xMin) / 3 + d;
            curveShape.cubicCurveTo( cp1x, cp1y, cp2x, cp2y, xMax, yAtXMax );
            break;
          case 2:
            // use bezier curve : must determine the control point
            // note that the curve will not go through the control point.
            var cpx = (xMin + xMax) / 2; // point halfway between xMin and xMax
            var cpy = b * xMin * xMax + c * (xMax + xMin) / 2 + d;
            curveShape.quadraticCurveTo( cpx, cpy, xMax, yAtXMax );
            break;
          default:
            curveShape.lineTo( xMax, yAtXMax );
            break;
        }

        // update path residuals, i.e. vertical line connecting data point to curve
        if ( residualsVisibleProperty.value ) {
          residualsShape = new Shape();

          points.forEach( function( point ) {
              residualsShape.moveToPoint( point.position );
              residualsShape.verticalLineTo( curve.getYValueAt( point.position.x ) );
          } );
        }
      } // end of if statement

      if ( curveShape ) {
        curvePath.setShape( modelViewTransform.modelToViewShape( curveShape ) );
      }
      else {
        curvePath.setShape( null );
      }
      if ( residualsShape ) {
        residualsPath.setShape( modelViewTransform.modelToViewShape( residualsShape ) );
      }
      else {
        residualsPath.setShape( null );
      }
    };

    curveVisibleProperty.linkAttribute( curvePath, 'visible' );
    residualsVisibleProperty.link( updateShape );
    curve.orderProperty.lazyLink( updateShape );
    curve.updateCurveEmitter.addListener( updateShape );
  }

  curveFitting.register( 'GraphAreaNode', GraphAreaNode );

  return inherit( Node, GraphAreaNode );
} );