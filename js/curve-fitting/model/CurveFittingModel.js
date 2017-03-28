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
  var Points = require( 'CURVE_FITTING/curve-fitting/model/Points' );
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

    // @public - Points for plotting curve. This includes points that are outside the bounds of the graph, so
    // be careful to call getPointsOnGraph when using points in calculations. Order of the points doesn't matter.
    this.points = new Points();

    // @public
    this.curve = new Curve( this.points, this.orderProperty, this.fitProperty );

    // Add internal listeners for adding and removing points
    var self = this;
    this.points.addItemAddedListener( function( point ) {
      self.addPoint( point );
    } );
    this.points.addItemRemovedListener( function( point ) {
      self.removePoint( point );
    } );

  }

  curveFitting.register( 'CurveFittingModel', CurveFittingModel );

  return inherit( Object, CurveFittingModel, {

    /**
     * @public Resets the model
     */
    reset: function() {
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
      point.positionProperty.link( this.curve.updateFitBinded );
      point.isInsideGraphProperty.lazyLink( this.curve.updateFitBinded );
      point.deltaProperty.link( this.curve.updateFitBinded );

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

      point.positionProperty.unlink( this.curve.updateFitBinded );
      point.isInsideGraphProperty.unlink( this.curve.updateFitBinded );
      point.deltaProperty.unlink( this.curve.updateFitBinded );
      this.curve.updateFit();
    }
  } );
} );