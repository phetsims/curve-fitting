// Copyright 2002-2019, University of Colorado Boulder

/**
 * Curve node in 'Curve Fitting' simulation.
 *
 * @author Martin Veillette (Berea College)
 */
define( require => {
  'use strict';

  // modules
  const curveFitting = require( 'CURVE_FITTING/curveFitting' );
  const CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Path = require( 'SCENERY/nodes/Path' );
  const Shape = require( 'KITE/Shape' );

  // constants
  const CURVE_OPTIONS = { stroke: 'black', lineWidth: 2 };

  class CurveNode extends Node {

    /**
     * @param {Curve} curve - curve model.
     * @param {Property.<boolean>} curveVisibleProperty
     * @param {ModelViewTransform2} modelViewTransform
     */
    constructor( curve, curveVisibleProperty, modelViewTransform ) {

      super();

      // add clip area
      this.clipArea = Shape.bounds( modelViewTransform.modelToViewBounds( CurveFittingConstants.CURVE_CLIP_BOUNDS ) );

      // create and add curve
      const curvePath = new Path( null, CURVE_OPTIONS );
      this.addChild( curvePath );

      /**
       * updates the curve
       */
      const updateCurve = () => {
        if ( curveVisibleProperty.value && curve.isCurvePresent() ) {
          curvePath.shape = modelViewTransform.modelToViewShape( curve.shape );
        }
        else {

          // reset the curve shape to null
          curvePath.shape = null;
        }
      };

      // unlinks unnecessary because this CurveNode is always present for the lifetime of the simulation
      curveVisibleProperty.link( updateCurve );
      curve.orderProperty.link( updateCurve );
      curve.updateCurveEmitter.addListener( updateCurve );
    }

  }

  return curveFitting.register( 'CurveNode', CurveNode );
} );
