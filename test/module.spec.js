/**
 * This spec tests the module instantiation and the $exceptionHandler
 * decorator logic.
 */

describe('[ng-rollbar-dd Module]', function() {
    var $exceptionHandler, $log;

    var $rootScopeSpy,
        $windowMock,
        RollbarSpy;

    // Spies and configuration
    beforeEach(module(function($provide, $exceptionHandlerProvider) {

        // $rootScope spy
        $provide.service('$rootScope', function() {
            $rootScopeSpy = jasmine.createSpyObj('$rootScope', ['$emit']);
            return $rootScopeSpy;
        });

        // $window Mock
        $provide.service('$window', function() {
            $windowMock = {
                Rollbar: RollbarSpy
            };
            return $windowMock;
        });

        // Log Spy
        $provide.service('$log', function() {
            $logSpy = jasmine.createSpyObj('$log', ['error', 'debug', 'warn', 'info']);
            return $logSpy;
        });

        // Rollbar spy
        RollbarSpy = jasmine.createSpyObj('Rollbar', ['error']);

        // Configure exception handling
        $exceptionHandlerProvider.mode('log');

    }));

    // Instantiate the module
    beforeEach(module('ng-rollbar-dd'));

    // Capture a reference to the exception handler
    beforeEach(inject(function(_$exceptionHandler_, _$log_) {
        $exceptionHandler = _$exceptionHandler_;
        $log = _$log_;
    }));

    /***************
     * Begin tests
     **************/

    describe('When initializing the module', function() {
        it('should declare the module object', function() {
            expect(typeof angular.module('ng-rollbar-dd')).toEqual('object');
        });
    });

    describe('When throwing an error', function() {
        var eventMock = {
            exception: 'MY EXCEPTION',
            err: 'MY ERR',
            data: 'MY DATA'
        };

        beforeEach(function() {
            // pass data to $exceptionHandler
            $exceptionHandler('MY EXCEPTION', 'MY CAUSE');

            // manually run the callback from the Rollbar spy
            RollbarSpy.error.calls.argsFor(0)[2]('MY ERR', {result: 'MY DATA'});
        });

        it('should log the error via Rollbar', function() {
            expect(RollbarSpy.error).toHaveBeenCalledWith('MY EXCEPTION', {cause: 'MY CAUSE'}, jasmine.any(Function));
        });

        it('should emit a rollbar event on $rootScope', function() {
            expect($rootScopeSpy.$emit).toHaveBeenCalledWith('rollbar:exception', eventMock);
        });
    });

    describe('when logging an error to the console through $log', function(){
        it('should log the error via Rollbar', function() {        
            $log.error('');
            expect(RollbarSpy.error).toHaveBeenCalled();
        });

        it('should still log the error to the console', function() {        
            $log.error('');
            expect($logSpy.error).toHaveBeenCalled();
        });

        it('should not send debug, info or warn messages to Rollbar', function() {        
            $log.debug('');
            $log.warn('');
            $log.info('');
            expect(RollbarSpy.error).not.toHaveBeenCalled();
        });
    });

});
