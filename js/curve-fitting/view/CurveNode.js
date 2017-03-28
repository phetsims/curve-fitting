// Copyright 2015-2016, University of Colorado Boulder

/**
 * Curve node in 'Curve Fitting' simulation.
 * Contains curve with residual lines
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );
  var CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );

  // constants
  var CURVE_OPTIONS = { stroke: 'black', lineWidth: 2 };
  var RESIDUAL_OPTIONS = { stroke: CurveFittingConstants.GRAY_COLOR, lineWidth: 2 };


  /**
   * @param {Points} points
   * @param {Curve} curve - curve model.
   * @param {Property.<boolean>} residualsVisibleProperty
   * @param {Property.<boolean>} curveVisibleProperty
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function CurveNode( points, curve, residualsVisibleProperty, curveVisibleProperty, modelViewTransform ) {

    Node.call( this );

    // model bounds of the graph
    var graphBounds = CurveFittingConstants.GRAPH_MODEL_BOUNDS;

    this.modelViewTransform = modelViewTransform;

    // add clip area
    this.clipArea = Shape.bounds( modelViewTransform.modelToViewBounds( graphBounds ) );

    // create and add curve
    var curvePath = new Path( null, CURVE_OPTIONS );
    this.addChild( curvePath );

    // create and add residual lines
    var residualsPath = new Path( null, RESIDUAL_OPTIONS );
    this.addChild( residualsPath );

    /**
     * updates the shape of the curve and the residuals
     */
    var updateShape = function() {
      var curveShape = null;
      var residualsShape = null;
      var pointsOnGraph = points.getPointsOnGraph();
      var order = curve.orderProperty.value;
      var a = curve.aProperty.value;
      var b = curve.bProperty.value;
      var c = curve.cProperty.value;
      var d = curve.dProperty.value;

      // ensure the order is 1, 2 or 3, linear, quadratic or cubic
      assert && assert( order === 1 || order === 2 || order === 3, 'invalid order: ' + order );

      //TODO This expression looks suspect, or at least overly complicated. Simplify or document.
      //TODO curve.fitProperty is private, should not be assigned here!!
      if ( ( pointsOnGraph.length > 1 || curve.fitProperty.value === 'adjustable' ) && !isNaN( a ) && !isNaN( b ) && !isNaN( c ) && !isNaN( d ) ) {

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
            var cp1x = (2 * xMin + xMax) / 3; // one third of the way between xMin and xMax
            var cp2x = (xMin + 2 * xMax) / 3; // two third of the way between xMin and xMax
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

          pointsOnGraph.forEach( function( point ) {
            residualsShape.moveToPoint( point.positionProperty.value );
            residualsShape.verticalLineTo( curve.getYValueAt( point.positionProperty.value.x ) );
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

  curveFitting.register( 'CurveNode', CurveNode );

  return inherit( Node, CurveNode );
} );