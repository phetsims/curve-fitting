// Copyright 2017-2018, University of Colorado Boulder

/**
 * Curve node in 'Curve Fitting' simulation.
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  const curveFitting = require( 'CURVE_FITTING/curveFitting' );
  const CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  const CurveFittingQueryParameters = require( 'CURVE_FITTING/curve-fitting/CurveFittingQueryParameters' );
  const inherit = require( 'PHET_CORE/inherit' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Path = require( 'SCENERY/nodes/Path' );
  const Shape = require( 'KITE/Shape' );

  // constants
  const CURVE_OPTIONS = { stroke: 'black', lineWidth: 2 };

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
    const curvePath = new Path( null, CURVE_OPTIONS );
    this.addChild( curvePath );

    /**
     * updates the curve
     */
    const updateCurve = () => {
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
      const curveDebugPath = new Path( null, { stroke: 'red', lineWidth: 2 } );
      this.addChild( curveDebugPath );

      /**
       * updates the debug curve
       */
      const updateDebugCurve = () => {
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