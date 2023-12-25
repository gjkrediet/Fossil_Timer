
return {
    node_name: '',
    manifest: {
        timers: ['select_tick', 'timer_tick']
    },
    persist: {},
    config: {},
    timer_start: 0,
    timer_time: 300,
    last_timer_time: 0,
    select_direction: '',
    state: 'timer_select',
    last_header_text: '',
    last_displayed_timer_hour: 0,
	last_displayed_time: -1,
	skipper: 0,
    title_refers_to_timer: false,
	inverted: true,

    handler: function (event, response) { // function 1
        this.wrap_event(event)
        this.wrap_response(response)
        this.state_machine.handle_event(event, response)
    },
    log: function (object) {
		object.logentry_from = this.node_name;
        req_data(this.node_name, '"type": "log", "data":' + JSON.stringify(object), 999999, true)
    },
    wrap_event: function (system_state_update_event) {
        if (system_state_update_event.type === 'system_state_update') {
            system_state_update_event.concerns_this_app = system_state_update_event.de
            system_state_update_event.old_state = system_state_update_event.ze
            system_state_update_event.new_state = system_state_update_event.le
        }
        return system_state_update_event
    },
    draw_display_timer: function (response, show_time) {
		var info_string = 'Timer'

        response.draw = {
            node_name: this.node_name,
            package_name: this.package_name,
            layout_function: 'layout_parser_json',
            background: get_common().U('INVERTED')?'BGtimer.raw':undefined,
            array: [],
            update_type: this.full_refresh_needed ? 'gc4' : 'du4',
            skip_invert: true,
        };
		var layout_info = {
			json_file: 'timer_layout',
		}
		if (get_common().U('WATCH_MODE') === 'RIGHTIE') {
			layout_info['button_topbot_x']= 190
			layout_info['button_topbot_lp_x']= 51
			layout_info['button_middle_x']= 207
			layout_info['button_middle_lp_x']= 37
			layout_info['topbot_hold_x']= 24
			layout_info['middle_hold_x']= 10
		} else {
			layout_info['button_topbot_x']= 24
			layout_info['button_topbot_lp_x']= 163
			layout_info['button_middle_x']= 10
			layout_info['button_middle_lp_x']= 190
			layout_info['topbot_hold_x']= 190
			layout_info['middle_hold_x']= 207
		}
        if (this.state === 'timer_run') {
			var time = this.calculate_time(this.calculate_remaining_timer_time())
			if (time.hours >0) {
				info_string += localization_snprintf(' +%d hours', time.hours)
			}
			layout_info['info']= info_string
			layout_info['button_bottom']= 'icHomestop'
			layout_info['button_top']= 'icRestore'
			if (show_time) {
				var h = "0" + get_common().hour;
				h = h.substring(h.length-2);
				var m = "0" + get_common().minute;
				m = m.substring(m.length-2);			
				layout_info['time'] = h + ':' + m;
			}
			if (this.calculate_remaining_timer_time() > 0) {	
				layout_info['button_top_lp']= 'icMinus'
				layout_info['top_hold']= 'icHold'
				layout_info['button_middle']= 'icHomeclock'
				layout_info['button_bottom_lp']= 'icPlus'
				layout_info['bottom_hold']= 'icHold'
			}				
        } else {
			layout_info['info']= info_string
			layout_info['button_bottom']= 'icPlus'
			layout_info['button_bottom_lp']= 'icForward'
			layout_info['bottom_hold']= 'icHold'
			if (this.timer_time > 0){
				layout_info['button_top']= 'icMinus'
				layout_info['button_middle']= 'icPlay'
				layout_info['button_top_lp']= 'icRestore'
				layout_info['top_hold']= 'icHold'
				layout_info['button_middle_lp']= 'icHomestop'
				layout_info['middle_hold']= 'icHold'
			} else {
				layout_info['button_middle']= 'icHomestop'
			}
		}
		layout_info['inverted'] = get_common().U('INVERTED');
		response.draw[this.node_name] = {
			'layout_info': layout_info,
			'layout_function': 'layout_parser_json',
		}
    },
    calculate_time: function (millis) {
        return {
            millis: millis % 1000,
            seconds: Math.floor(millis / 1000 % 60),
            minutes: Math.floor(millis / 60000 % 60),
            hours: Math.floor(millis / 3600000),
        }
    },
    wrap_state_machine: function(state_machine) {
        state_machine.set_current_state = state_machine.d
        state_machine.handle_event = state_machine._
        state_machine.get_current_state = function(){
            return state_machine.n
        }

        return state_machine
    },
    get_current_time: function(){
        return {
            minute: common.minute,
            hour: common.hour
        }
    },
    wrap_response: function (response) {
        response.move_hands = function (degrees_hour, degrees_minute, relative) {
            response.move = {
                h: degrees_hour,
                m: degrees_minute,
                is_relative: relative
            }
        }
        response.draw_screen = function (node_name, full_update, layout_info) {
            response.draw = {
                update_type: full_update ? 'du4' : 'gu4'
            }
            response.draw[node_name] = {
                layout_function: 'layout_parser_json',
                layout_info: layout_info
            }
        }
        response.send_user_class_event = function (event_type) {
            response.send_generic_event({
                type: event_type,
                class: 'user'
            })
        }
        response.go_back = function (kill_app) {
			// uncomment next line if you want to use my timer-widget
			// if (kill_app) get_common().V('TIMER',-999);
            response.action = {
                type: 'go_back',
                Se: kill_app,
            };
        };
        response.go_visible = function () {
            response.action = {
                type: 'go_visible',
                class: 'alert',
            };
        };
        response.vibrate_pattern = function(type){
            response.vibe = type
        }
        response.send_generic_event = function (event_object) {
            if (response.i == undefined) response.i = []
            response.i.push(event_object)
        }
        return response
    },
    calculate_remaining_timer_time: function () {
        return this.timer_time - (now() - this.timer_start)
    },
    display_time_select: function (response) {
        var time = this.calculate_time(this.timer_time)

        var angle_mins = time.minutes * 6
        var angle_hours = angle_mins
        if (time.hours > 0) {
            angle_hours = time.hours * 30 + (time.minutes / 60) * 30
        }
        response.move_hands(angle_hours, angle_mins, false)
    },
    display_time_running: function (response) {
        var millis_to_display
        if (this.state === 'timer_run') {
            millis_to_display = this.calculate_remaining_timer_time()
			if (millis_to_display<0) {
				millis_to_display *= -1
			}
        }
        var time = this.calculate_time(millis_to_display)
        var angle_mins = time.seconds * 6
/*
		if (millis_to_display < 0) {
			angle_mins = Math.floor((millis_to_display/1000) * -6)
		}
*/
        if (time.minutes == 0 || (time.minutes == 1 && time.seconds ==0)) {
            angle_hours = angle_mins
        } else {
            angle_hours = time.minutes * 6 + (time.seconds / 60) * 6
        }
        response.move_hands(angle_hours, angle_mins, false)
    },
    time_select_forward: function (response) {
        var mins = Math.floor(this.timer_time / (60 * 1000))
        if (mins % 5 == 0) mins += 5
        else mins += 5 - (mins % 5)
        this.timer_time = mins * 60 * 1000
        this.display_time_select(response)
    },
    start_forward_timer: function () {
        start_timer(this.node_name, 'select_tick', 150)
    },
    start_timer_tick_timer: function () {
        var timeout = 0
        timeout = this.calculate_remaining_timer_time() % 1000
        if (timeout <= 0) timeout = 1000
        start_timer(this.node_name, 'timer_tick', timeout)
    },
    check_timer_time: function (response) {
        if (this.state === 'timer_run') {
            var remaining = this.calculate_remaining_timer_time()
			if (remaining < 30000) {
				response.go_visible()
			}
			if (remaining < 0) {
				if (this.skipper==0) {
					response.vibrate_pattern('text')
				}
				++ this.skipper
				if (this.skipper>((60000+remaining)/6000)) this.skipper=0 //ga steeds vaker trillen
			} 
			else this.skipper=0
            if (remaining <= -300000) {
                // reset timer
                this.last_timer_time = this.timer_time
                this.timer_time = 0
                this.state_machine.set_current_state('timer_select')
            }
        }

        this.start_timer_tick_timer()
    },
    handle_global_event: function (self, state_machine, event, response) {
        self.log(event)
        if (event.type === 'system_state_update' && event.concerns_this_app === true) {
            if (event.new_state === 'visible') {
                state_machine.set_current_state(self.state)
            } else {
                state_machine.set_current_state('background')
            }
        } else if (event.type === 'middle_hold') {
            response.go_back(self.state == 'timer_select')
        } else if (event.type === 'middle_short_press_release' && self.timer_time == 0) {
			response.go_back(self.state == 'timer_select')
        } else if (event.type === 'timer_restart') {
            self.timer_time = self.last_timer_time
            self.timer_start = now()
            self.start_timer_tick_timer()
            if (state_machine.get_current_state !== 'background') {
                state_machine.set_current_state('timer_run')
            } else {
                self.state = 'timer_run'
            }
        } else if (event.type === 'timer_dismiss') {
            response.go_back(true)
        }
    },
    handle_state_specific_event: function (state, state_phase) {
        switch (state) {
            case 'background': {
                if (state_phase == 'during') {
                    return function (self, state_machine, event, response) {
						// uncomment next line if you want to use my timer-widget
						// get_common().V('TIMER',Math.floor(self.calculate_remaining_timer_time()/1000));
                        type = event.type
                        if (type === 'timer_expired') {
                            if (is_this_timer_expired(event, self.node_name, 'timer_tick')) {
                                self.check_timer_time(response)
                            }
                        }
                    }
                }
                break;
            }
            case 'timer_select': {
                if (state_phase == 'entry') {
                    return function (self, response) {
						self.timer_time = get_common().U('TIMER_PRESET')!=undefined ? get_common().U('TIMER_PRESET') : 300;
                        self.state = 'timer_select';
                        self.draw_display_timer(response, false)
                        self.display_time_select(response);
                    }
                }
                if (state_phase == 'during') {
                    return function (self, state_machine, event, response) {
                        type = event.type
                        if (type === 'middle_short_press_release') {
                            self.timer_start = now()
							self.last_timer_time=self.timer_time
                            self.start_timer_tick_timer()
                            self.last_displayed_timer_hour = 0
                            if (self.timer_time != 0) {
                                self.state_machine.set_current_state('timer_run')
								get_common().V('TIMER_PRESET', self.timer_time);
                            }
                        } else if (type === 'top_short_press_release') {
                            if (self.timer_time > 0) {
                                self.timer_time -= 60 * 1000
                                if (self.timer_time < 0) self.timer_time = 0
                                self.display_time_select(response)
                            }
                        } else if (type === 'top_hold') {
                            self.timer_time = 0
                            self.display_time_select(response)
                        } else if (type === 'bottom_short_press_release') {
                            self.time_select_forward(response)
                        } else if (type === 'bottom_hold') {
                            self.time_select_forward(response)
                            self.select_direction = 'forward'
                            self.start_forward_timer()
                        } else if (type === 'timer_expired') {
                            if (is_this_timer_expired(event, self.node_name, 'select_tick')) {
                                if (self.select_direction === 'forward') {
                                    self.time_select_forward(response)
                                    self.start_forward_timer()
                                }
                            }
                        } else if (type === 'bottom_long_press_release') {
                            self.select_direction = ''
                            stop_timer(self.node_name, 'select_tick')
                        }
                        if (
                            type === 'top_short_press_release'
                            || type === 'bottom_short_press_release'
                            || type === 'top_long_press_release'
                            || type === 'bottom_long_press_release'
                        ) {
                            var title_should_refer_to_timer = self.timer_time > 0
                            if (self.title_refers_to_timer != title_should_refer_to_timer) {
                                self.draw_display_timer(response, false)
                                self.title_refers_to_timer = title_should_refer_to_timer
                            }
                        }
                    }
                }
                if (state_phase == 'exit') {
                    return function (arg, arg2) { // function 14, 20
                    }
                }
                break;
            }
            case 'timer_run': {
                if (state_phase == 'entry') {
                    return function (self, response) {
                        self.state = state
                        self.display_time_running(response)
                        self.draw_display_timer(response, true)
                    }
                }
                if (state_phase == 'during') {
                    return function (self, state_machine, event, response) {
						// uncomment next line if you want to use my timer-widget
						// get_common().V('TIMER',Math.floor(self.calculate_remaining_timer_time()/1000));
                        type = event.type
                        if (type === 'middle_short_press_release' && self.calculate_remaining_timer_time() > 0) {
                            response.go_back(false)
                        } else if (type === 'timer_expired') {
                            if (is_this_timer_expired(event, self.node_name, 'timer_tick')) {
                                self.check_timer_time(response)
                                self.display_time_running(response)
                                var time = self.calculate_time(self.calculate_remaining_timer_time())
                                if (time.hours != self.last_displayed_timer_hour || get_common().minute != self.last_displayed_time) {
                                    self.draw_display_timer(response, true)
                                    self.last_displayed_timer_hour = time.hours
									self.last_displayed_time = get_common().minute;
                                }
                            }
                        } else if (type === 'top_short_press_release') {
                            stop_timer(self.node_name, 'timer_tick')
                            self.timer_time = self.last_timer_time
                            self.timer_time -= self.timer_time % (60 * 1000)
                            state_machine.set_current_state('timer_select')
                        } else if (type === 'bottom_short_press_release') {
							stop_timer(self.node_name, 'select_tick')
                            self.timer_time = self.last_timer_time
                            response.go_back(true)
                        } else if (type === 'bottom_hold') {
                            self.timer_start += 60 * 1000
                            self.display_time_running(response)
                        } else if (type === 'top_hold') {
                            self.timer_start -= 60 * 1000
                            self.display_time_running(response)
						}
                    }
                }
                if (state_phase == 'exit') {
                    return function (arg, arg2) { // function 14, 20

                    }
                }
                break
            }
        }
        return
    },
    init: function () { // function 8
        this.state_machine = new state_machine(
            this,
            this.handle_global_event,
            this.handle_state_specific_event,
            undefined,
            'background'
        )
        this.wrap_state_machine(this.state_machine)
    }
}
















