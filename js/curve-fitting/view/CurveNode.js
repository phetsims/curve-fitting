// Copyright 2015-2016, University of Colorado Boulder

/**
 * Curve node in 'Curve Fitting' simulation.
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

  /**
   * @param {Points} points
   * @param {Curve} curve - curve model.
   * @param {Property.<boolean>} curveVisibleProperty
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function CurveNode( points, curve, curveVisibleProperty, modelViewTransform ) {

    Node.call( this );

    // model bounds of the graph
    var graphBounds = CurveFittingConstants.GRAPH_MODEL_BOUNDS;

    // add clip area
    this.clipArea = Shape.bounds( modelViewTransform.modelToViewBounds( graphBounds ) );

    // create and add curve
    var curvePath = new Path( null, CURVE_OPTIONS );
    this.addChild( curvePath );

    /**
     * updates the curve
     */
    var updateCurve = function() {
      var pointsOnGraph = points.getPointsOnGraph();

      if ( curveVisibleProperty.value && curve.isValidFit && ( pointsOnGraph.length > 1 || curve.fitProperty.value === 'adjustable' ) ) {

        // convenience variables
        var xMin = graphBounds.minX;// minimum value of the x range
        var xMax = graphBounds.maxX; // maximum value of the x range
        var yAtXMin = curve.getYValueAt( xMin );
        var yAtXMax = curve.getYValueAt( xMax );
        var a = curve.aProperty.value;
        var b = curve.bProperty.value;
        var c = curve.cProperty.value;
        var d = curve.dProperty.value;

        // update curve shape and path
        var curveShape = new Shape();
        curveShape.moveTo( xMin, yAtXMin );

        // curve is a line, quadratic or cubic depending on the order of the fit.
        switch( curve.orderProperty.value ) {
          case 3: //cubic
            // use bezier curve : must determine the control points
            // note that the curve will not go through the control points.
            var cp1x = (2 * xMin + xMax) / 3; // one third of the way between xMin and xMax
            var cp2x = (xMin + 2 * xMax) / 3; // two third of the way between xMin and xMax
            var cp1y = a * xMax * xMin * xMin + b * (xMin + 2 * xMax) * xMin / 3 + c * (2 * xMin + xMax) / 3 + d;
            var cp2y = a * xMin * xMax * xMax + b * (xMax + 2 * xMin) * xMax / 3 + c * (2 * xMax + xMin) / 3 + d;
            curveShape.cubicCurveTo( cp1x, cp1y, cp2x, cp2y, xMax, yAtXMax );
            break;
          case 2: // quadratic
            // use bezier curve : must determine the control point
            // note that the curve will not go through the control point.
            var cpx = (xMin + xMax) / 2; // point halfway between xMin and xMax
            var cpy = b * xMin * xMax + c * (xMax + xMin) / 2 + d;
            curveShape.quadraticCurveTo( cpx, cpy, xMax, yAtXMax );
            break;
          default: // linear
            curveShape.lineTo( xMax, yAtXMax );
            break;
        }
        curvePath.setShape( modelViewTransform.modelToViewShape( curveShape ) );
      }
      else {
        // reset the curve shape to null
        curvePath.setShape( null );
      }
    };

    curveVisibleProperty.link( updateCurve );
    curve.orderProperty.link( updateCurve );
    curve.updateCurveEmitter.addListener( updateCurve );
  }

  curveFitting.register( 'CurveNode', CurveNode );

  return inherit( Node, CurveNode );
} )
;