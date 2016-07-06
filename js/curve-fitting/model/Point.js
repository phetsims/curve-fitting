// Copyright 2015, University of Colorado Boulder

/**
 * Point model in 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';

  // modules
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );

  /**
   * @constructor
   */
  function Point() {
    PropertySet.call( this, {
      isInsideGraph: false, // flag to control graph area affiliation
      x: 0, // x-coordinate of point
      y: 0, // y-coordinate of point
      delta: 0.8 // delta variation of point
    } );
  }

  curveFitting.register( 'Point', Point );

  return inherit( PropertySet, Point, {
    /**
     * sets the point coordinates
     * @param {Vector2} position
     * @public
     */
    setXY: function( position ) {
      this.x = position.x;
      this.y = position.y;
      this.trigger( 'updateXY' );
    }
  } );
} );