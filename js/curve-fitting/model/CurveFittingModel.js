//  Copyright 2002-2014, University of Colorado Boulder

/**
 *
 * @author John Blanco (PhET)
 */
define( function( require ) {
  'use strict';

  // modules
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
      isCurve: false,
      isResiduals: false,
      isValues: false,
      curveType: CurveType.LINEAR,
      fitType: FitType.BEST
    } );
  }

  return inherit( PropertySet, CurveFittingModel, {

    // Called by the animation loop. Optional, so if your model has no animation, you can omit this.
    step: function( dt ) {
      // Handle model animation here.
    }
  } );
} );