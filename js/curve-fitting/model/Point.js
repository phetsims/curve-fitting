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
  var CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  var Emitter = require( 'AXON/Emitter' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   * @param {Vector2} initialPosition - The initial position the point has
   * @constructor
   */
  function Point( initialPosition ) {
    var self = this;
    PropertySet.call( this, {
      isInsideGraph: false, // flag to control graph area affiliation
      position: initialPosition, // initial position of the point at creation
      isUserControlled: false, // flag that controls if the user grabbed this
      isAnimating: false, // flag to control if it is animating
      delta: 0.8 // delta variation of point
    } );

    // check and set the flag that indicates if the point is within the bounds of the graph
    this.positionProperty.link( function( position ) {
      // Determines if the position of a point is within the visual bounds of the graph and is not animated on its way back
      self.isInsideGraph = CurveFittingConstants.GRAPH_MODEL_BOUNDS.containsPoint( position ) && !self.isAnimating;
    } );

    //if the user dropped the ball outside of the graph send it back to the bucket
    this.isUserControlledProperty.lazyLink( function( isUserControlled ) {
      if ( !isUserControlled && !self.isInsideGraph && !self.isAnimating ) {
        self.animate();
      }
    } );

    // create emitter that will signal that the point has returned to the bucket
    this.returnToOriginEmitter = new Emitter();
  }

  curveFitting.register( 'Point', Point );

  return inherit( PropertySet, Point, {

    /**
     * Function that animates the point back to the bucket
     * @public
     */
    animate: function() {
      var self = this;
      this.isAnimating = true;

      var location = {
        x: this.position.x,
        y: this.position.y
      };

      // distance to the bucket
      var distance = this.positionProperty.initialValue.distance( this.position );

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