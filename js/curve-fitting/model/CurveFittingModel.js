// Copyright 2015-2017, University of Colorado Boulder

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
  var CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var NumberProperty = require( 'AXON/NumberProperty' );
  var Points = require( 'CURVE_FITTING/curve-fitting/model/Points' );
  var Property = require( 'AXON/Property' );

  // constants
  var VALID_FIT_VALUES = [ 'best', 'adjustable' ];

  /**
   * @constructor
   */
  function CurveFittingModel() {

    var self = this;

    // @public {Property.<number>} order of the polynomial that describes the curve, valid values are 1, 2, 3
    this.orderProperty = new NumberProperty( 1 );

    // @public {Property.<string>}, the method of fitting the curve to data points, see VALID_FIT_VALUES
    this.fitProperty = new Property( 'best' );

    // @public {Property.<number>[]}, user input values for coefficients of the polynomial, starting from lowest order x^0 to x^3
    this.sliderPropertyArray = [
      new NumberProperty( CurveFittingConstants.CONSTANT_RANGE.defaultValue ),
      new NumberProperty( CurveFittingConstants.LINEAR_RANGE.defaultValue ),
      new NumberProperty( CurveFittingConstants.QUADRATIC_RANGE.defaultValue ),
      new NumberProperty( CurveFittingConstants.CUBIC_RANGE.defaultValue )
    ];

    // @public - Points for plotting curve. This includes points that are outside the bounds of the graph, so
    // be careful to call getPointsOnGraph when using points in calculations. Order of the points doesn't matter.
    this.points = new Points();

    // @public - the model of the curve
    this.curve = new Curve( this.points, this.sliderPropertyArray, this.orderProperty, this.fitProperty );

    // validate Property values and update curve fit
    this.orderProperty.link( function( order ) {
      // ensure the order is 1, 2 or 3: linear, quadratic or cubic
      assert && assert( order === 1 || order === 2 || order === 3, 'invalid order: ' + order );
      self.curve.updateFit();
    } );
    this.fitProperty.link( function( fit ) {
      assert && assert( _.includes( VALID_FIT_VALUES, fit ), 'invalid fit: ' + fit );
      self.curve.updateFit();
    } );

    // a change of any of the value sliders force an update of the curve model
    this.sliderPropertyArray.forEach( function( sliderProperty ) {
      sliderProperty.link( function() {self.curve.updateFit();} );
    } );

    // Add internal listeners for adding and removing points
    this.points.addItemAddedListener( function( point ) {
      self.addPoint( point );
    } );
    this.points.addItemRemovedListener( function( point ) {
      self.removePoint( point );
    } );

    // @private
    this.updateFitBound = this.curve.updateFit.bind( this.curve );
  }

  curveFitting.register( 'CurveFittingModel', CurveFittingModel );

  return inherit( Object, CurveFittingModel, {

    /**
     * Resets the model
     * @public
     */
    reset: function() {
      this.sliderPropertyArray.forEach( function( sliderProperty ) {
        sliderProperty.reset();
      } );
      this.orderProperty.reset();
      this.fitProperty.reset();
      this.points.reset();
      this.curve.reset();
    },
    
    /**
     * Adds a point
     *
     * @param {Point} point
     * @private
     */
    addPoint: function( point ) {
      var self = this;

      // These are unlinked in removePoint
      point.positionProperty.link( this.updateFitBound );
      point.isInsideGraphProperty.link( this.updateFitBound );
      point.deltaProperty.link( this.updateFitBound );

      // remove points when they have returned to the bucket
      point.returnToOriginEmitter.addListener( function removePointListener() {
        self.points.remove( point );
        point.returnToOriginEmitter.removeListener( removePointListener );
      } );
    },

    /**
     * Removes a point
     *
     * @param {Point} point
     * @private
     */
    removePoint: function( point ) {

      // These were linked in addPoint
      point.positionProperty.unlink( this.updateFitBound );
      point.isInsideGraphProperty.unlink( this.updateFitBound );
      point.deltaProperty.unlink( this.updateFitBound );

      this.curve.updateFit();
    }
  } );
} );