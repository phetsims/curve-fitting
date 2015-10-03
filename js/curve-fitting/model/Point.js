// Copyright 2002-2014, University of Colorado Boulder

/**
 * Point model in 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';

  // modules
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

  return inherit( PropertySet, Point, {
    setXY: function( obj ) {
      this.x = obj.x;
      this.y = obj.y;
      this.trigger( 'updateXY' );
    }
  } );
} );