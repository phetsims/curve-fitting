//  Copyright 2002-2014, University of Colorado Boulder

/**
 *
 * @author John Blanco (PhET)
 */
define( function( require ) {
  'use strict';

  // modules
  var Curve = require( 'CURVE_FITTING/curve-fitting/model/Curve' );
  var CurveType = require( 'CURVE_FITTING/curve-fitting/model/CurveType' );
  var FitType = require( 'CURVE_FITTING/curve-fitting/model/FitType' );
  var inherit = require( 'PHET_CORE/inherit' );
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

    this.curveModel = new Curve( this.property( 'curveType' ) );
  }

  return inherit( PropertySet, CurveFittingModel, {

    // Called by the animation loop. Optional, so if your model has no animation, you can omit this.
    step: function( dt ) {
      // Handle model animation here.
    }
  } );
} );