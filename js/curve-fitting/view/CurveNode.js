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
  var CurveFittingQueryParameters = require( 'CURVE_FITTING/curve-fitting/CurveFittingQueryParameters' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );

  // constants
  var CURVE_OPTIONS = { stroke: 'black', lineWidth: 2 };

  /**
   * @param {Curve} curve - curve model.
   * @param {Property.<boolean>} curveVisibleProperty
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function CurveNode( curve, curveVisibleProperty, modelViewTransform ) {

    Node.call( this );

    // add clip area
    this.clipArea = Shape.bounds( modelViewTransform.modelToViewBounds( CurveFittingConstants.GRAPH_MODEL_BOUNDS ) );

    // create and add curve
    var curvePath = new Path( null, CURVE_OPTIONS );
    this.addChild( curvePath );

    /**
     * updates the curve
     */
    var updateCurve = function() {

      if ( curveVisibleProperty.value && curve.isCurvePresent() ) {
        curvePath.setShape( modelViewTransform.modelToViewShape( curve.getShape() ) );
      }
      else {
        // reset the curve shape to null
        curvePath.setShape( null );
      }
    };

    curveVisibleProperty.link( updateCurve );
    curve.orderProperty.link( updateCurve );
    curve.updateCurveEmitter.addListener( updateCurve );

    // for debugging purposes.
    if ( CurveFittingQueryParameters.debugLine ) {
      // create and add curve
      var curveDebugPath = new Path( null, { stroke: 'red', lineWidth: 2 } );
      this.addChild( curveDebugPath );

      /**
       * updates the debug curve
       */
      var updateDebugCurve = function() {

        if ( curveVisibleProperty.value && curve.isCurvePresent() ) {
          curveDebugPath.setShape( modelViewTransform.modelToViewShape( curve.getDebugShape() ) );
        }
        else {
          // reset the curve shape to null
          curveDebugPath.setShape( null );
        }
      };

      curveVisibleProperty.link( updateDebugCurve );
      curve.orderProperty.link( updateDebugCurve );
      curve.updateCurveEmitter.addListener( updateDebugCurve );
    }
  }

  curveFitting.register( 'CurveNode', CurveNode );

  return inherit( Node, CurveNode );
} )
;