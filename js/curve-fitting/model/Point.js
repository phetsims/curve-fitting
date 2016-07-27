// Copyright 2015-2016, University of Colorado Boulder

/**
 * Point model in 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';

  // modules
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );
  var CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  var Emitter = require( 'AXON/Emitter' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   * @param {Object} [options]
   * @constructor
   */
  function Point( options ) {

    options = _.extend( {
      position: new Vector2( 0, 0 ), // {Vector2} initial position
      isUserControlled: false // {boolean} is the user dragging the point?
    }, options );

    var self = this;

    PropertySet.call( this, {
      position: options.position,

      //TODO why is this needed?
      isInsideGraph: false, // {boolean} is the point inside the graph?

      //TODO rename to dragging
      isUserControlled: options.isUserControlled, // {boolean} is the user dragging the point?

      //TODO rename, too vague
      delta: 0.8 // delta variation of point
    } );

    //TODO why is this needed?
    // @private is the point animating?
    this.animating = false;

    // check and set the flag that indicates if the point is within the bounds of the graph
    this.positionProperty.link( function( position ) {
      // Determines if the position of a point is within the visual bounds of the graph and is not animated on its way back
      self.isInsideGraph = CurveFittingConstants.GRAPH_MODEL_BOUNDS.containsPoint( position ) && !self.animating;
    } );

    //if the user dropped the ball outside of the graph send it back to the bucket
    this.isUserControlledProperty.lazyLink( function( isUserControlled ) {
      if ( !isUserControlled && !self.isInsideGraph && !self.animating ) {
        self.animate();
      }
    } );

    // create emitter that will signal that the point has returned to the bucket
    this.returnToOriginEmitter = new Emitter();
  }

  curveFitting.register( 'Point', Point );

  return inherit( PropertySet, Point, {

    /**
     * Animates the point back to the bucket.
     *
     * @public
     */
    animate: function() {

      var self = this;
      this.animating = true;

      var location = {
        x: this.position.x,
        y: this.position.y
      };

      // distance to the bucket
      var distance = this.positionProperty.initialValue.distance( this.position );

      //TODO reformat this mess
      var animationTween = new TWEEN.Tween( location ).to( {
        x: this.positionProperty.initialValue.x,
        y: this.positionProperty.initialValue.y
      }, distance / CurveFittingConstants.ANIMATION_SPEED ).easing( TWEEN.Easing.Cubic.In ).onUpdate( function() {
        self.position = new Vector2( location.x, location.y );
      } ).onComplete( function() {
        self.animating = false;
        self.returnToOriginEmitter.emit();
      } );

      animationTween.start();
    }
  } );
} );