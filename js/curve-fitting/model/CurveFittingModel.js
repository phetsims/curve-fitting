//  Copyright 2002-2014, University of Colorado Boulder

/**
 *
 * @author John Blanco (PhET)
 */
define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var Curve = require( 'CURVE_FITTING/curve-fitting/model/Curve' );
  var CurveType = require( 'CURVE_FITTING/curve-fitting/model/CurveType' );
  var FitType = require( 'CURVE_FITTING/curve-fitting/model/FitType' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Point = require( 'CURVE_FITTING/curve-fitting/model/Point' );
  var PropertySet = require( 'AXON/PropertySet' );

  /**
   * Main constructor for CurveFittingModel, which contains all of the model logic for the entire sim screen.
   * @constructor
   */
  function CurveFittingModel() {
    PropertySet.call( this, {
      isCurve: false, // curve flag visibility
      isResiduals: false, // residuals flag
      isValues: false, // values flag visibility
      curveType: CurveType.LINEAR, // property to control curve type
      fitType: FitType.BEST, // property to control fit type
      isDeviationPanelExpanded: true // property to control deviation panel expansion
    } );

    // max order of fit
    this.maxOrderOfFit = 4;

    // curve model
    this.curve = new Curve( this.curveTypeProperty );

    // graph area size
    this.graphArea = new Bounds2( -22, -24, 22, 24 );
  }

  return inherit( PropertySet, CurveFittingModel, {

    getPoint: function( position ) {
      return new Point( position );
    },

    // Called by the animation loop. Optional, so if your model has no animation, you can omit this.
    step: function( dt ) {
      // Handle model animation here.
    }
  } );
} );