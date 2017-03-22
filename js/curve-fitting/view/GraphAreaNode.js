// Copyright 2015-2016, University of Colorado Boulder

//TODO rename, untangle
/**
 * Graph area node in 'Curve Fitting' simulation.
 * Contains graph area, curve and panel with equation parameters.
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
   * @param {Property.<number>} orderProperty
   * @param {Property.<boolean>} residualsVisibleProperty
   * @param {Bounds2} graphBounds -  bounds of the graph, in model coordinate frame
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options] for graph node.
   * @constructor
   */
  function GraphAreaNode( curve, orderProperty, residualsVisibleProperty, graphBounds, modelViewTransform, options ) {

    Node.call( this, options );

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
      var order = orderProperty.value;
      var xMin = graphBounds.minX;
      var xMax = graphBounds.maxX;
      var points = curve.getPoints();
      var a = curve.a;
      var b = curve.b;
      var c = curve.c;
      var d = curve.d;

      //TODO This expression looks suspect, or at least overly complicated. Simplify or document.
      //TODO curve.fitProperty is private, should not be assigned here!!
      if ( ( points.length > 1 || curve.fitProperty.value === 'adjustable' ) && !isNaN( a ) && !isNaN( b ) && !isNaN( c ) && !isNaN( d ) ) {

        // update curve path
        curveShape = new Shape();
        curveShape.moveTo( xMin, curve.getYValueAt( xMin ) );

        switch( order ) {
          case 1:
            curveShape.lineTo( xMax, curve.getYValueAt( xMax ) );
            break;
          case 2:
            // use bezier curve : must determine the control point
            // note that the curve will not go through the control point.
            var cpx = (xMin + xMax) / 2;
            var cpy = (b * xMin + c / 2) * (xMax - xMin) + curve.getYValueAt( xMin );
            curveShape.quadraticCurveTo( cpx, cpy, xMax, curve.getYValueAt( xMax ) );
            break;
          case 3:
            // use bezier curve : must determine the control points
            // note that the curve will not go through the control points.
            var cp1x = (2 * xMin + xMax) / 3; // one third of the way between xMmin and xMax
            var cp2x = (xMin + 2 * xMax) / 3; // two third of the way between xMmin and xMax
            var cp1y = a * xMax * xMin * xMin + b * (xMin + 2 * xMax) * xMin / 3 + c * (2 * xMin + xMax) / 3 + d;
            var cp2y = a * xMin * xMax * xMax + b * (xMax + 2 * xMin) * xMax / 3 + c * (2 * xMax + xMin) / 3 + d;
            curveShape.cubicCurveTo( cp1x, cp1y, cp2x, cp2y, xMax, curve.getYValueAt( xMax ) );
            break;
          default:
            assert && assert( true, 'order should be 1 2 or 3');
            break;
        }

        // update path residuals
        if ( residualsVisibleProperty.value ) {
          residualsShape = new Shape();

          points.forEach( function( point ) {
            //TODO why is this not testing for a specific order value?
            if ( order ) {
              residualsShape.moveToPoint( point.position );
              residualsShape.verticalLineTo( curve.getYValueAt( point.position.x ) );
            }
          } );
        }
      }
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

    curve.isVisibleProperty.linkAttribute( curvePath, 'visible' );
    orderProperty.lazyLink( updateShape );
    residualsVisibleProperty.link( updateShape );
    curve.updateCurveEmitter.addListener( updateShape );
  }

  curveFitting.register( 'GraphAreaNode', GraphAreaNode );

  return inherit( Node, GraphAreaNode );
} );