// Copyright 2015-2016, University of Colorado Boulder

/**
 * Model container for 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';

  // modules
  var Bucket = require( 'PHETCOMMON/model/Bucket' );
  var Curve = require( 'CURVE_FITTING/curve-fitting/model/Curve' );
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );
  var CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var BUCKET_WIDTH = 5; // in model coordinates
  var BUCKET_HEIGHT = BUCKET_WIDTH * 0.50;
  // bucket is to the left and up from the bottom left corner of graph, in model coordinates
  var BUCKET_POSITION = new Vector2( CurveFittingConstants.GRAPH_MODEL_BOUNDS.minX - 3, CurveFittingConstants.GRAPH_MODEL_BOUNDS.minY + 1 );
  var VALID_FIT_VALUES = [ 'best', 'adjustable' ];

  /**
   * @constructor
   */
  function CurveFittingModel() {

    PropertySet.call( this, {

      // @public
      order: 1, // {number} order of the polynomial that describes the curve
      fit: 'best' // {string} the method of fitting the curve to data points, see VALID_FIT_VALUES
    } );

    // validate Property values
    this.orderProperty.link( function( order ) {
      assert && assert( order >= 1 && order <= 3, 'invalid order: ' + order );
    } );
    this.fitProperty.link( function( fit ) {
      assert && assert( _.includes( VALID_FIT_VALUES, fit ), 'invalid fit: ' + fit );
    } );

    //TODO this field is not used consistently, see https://github.com/phetsims/curve-fitting/issues/88
    // @public (read-only)
    this.graphModelBounds = CurveFittingConstants.GRAPH_MODEL_BOUNDS;

    // @public (read-only)
    this.bucket = new Bucket( {
      position: BUCKET_POSITION,
      size: new Dimension2( BUCKET_WIDTH, BUCKET_HEIGHT ),
      baseColor: 'rgb( 65, 63, 117 )'
    } );

    // @public
    this.curve = new Curve( this.orderProperty, this.fitProperty );
  }

  curveFitting.register( 'CurveFittingModel', CurveFittingModel );

  return inherit( PropertySet, CurveFittingModel, {

    // @public
    reset: function() {
      PropertySet.prototype.reset.call( this );
      this.curve.reset();
    }
  } );
} );