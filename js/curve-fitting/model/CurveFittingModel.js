// Copyright 2015-2016, University of Colorado Boulder

/**
 * Model container for 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';

  // modules
  var Curve = require( 'CURVE_FITTING/curve-fitting/model/Curve' );
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );
  var inherit = require( 'PHET_CORE/inherit' );
  var NumberProperty = require( 'AXON/NumberProperty' );
  var Property = require( 'AXON/Property' );

  // constants
  var VALID_FIT_VALUES = [ 'best', 'adjustable' ];

  /**
   * @constructor
   */
  function CurveFittingModel() {

    // @public {Property.<number>} order of the polynomial that describes the curve, valid values are 1, 2, 3
    this.orderProperty = new NumberProperty( 1 );

    // @public {Property.<string>}, the method of fitting the curve to data points, see VALID_FIT_VALUES
    this.fitProperty = new Property( 'best' );

    // validate Property values
    this.orderProperty.link( function( order ) {
      assert && assert( order >= 1 && order <= 3, 'invalid order: ' + order );
    } );
    this.fitProperty.link( function( fit ) {
      assert && assert( _.includes( VALID_FIT_VALUES, fit ), 'invalid fit: ' + fit );
    } );

    // @public
    this.curve = new Curve( this.orderProperty, this.fitProperty );
  }

  curveFitting.register( 'CurveFittingModel', CurveFittingModel );

  return inherit( Object, CurveFittingModel, {

    /**
     * @public Resets the model
     */
    reset: function() {
      this.orderProperty.reset();
      this.fitProperty.reset();
      this.curve.reset();
    }
  } );
} );