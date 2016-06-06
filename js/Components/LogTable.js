import {Component} from 'react';
import {LogEntry} from './LogEntry.js';
import {LogLevel} from './LogLevel.js';
import Timestamp from 'react-time';
import MediaQuery from 'react-responsive';

import style from './LogTable.less';

export class LogTable extends Component {
	render () {
		var rows = this.props.entries.map((entry, i) => {
			var time = new Date(entry.time);
			return (
				<tr className={style['level_' + entry.level]} key={i}>
					<td className={style.level}><LogLevel level={entry.level}/>
					</td>
					<td className={style.app}>{entry.app}</td>
					<td className={style.message}><LogEntry
						message={entry.message}/></td>
					<td className={style.time}><Timestamp value={time}
														  relative/></td>
				</tr>
			)
		});

		var smallRows = this.props.entries.map((entry, i) => {
			var time = new Date(entry.time);
			return (
				<div className={style['level_' + entry.level] + ' ' + style.row} key={i}>
					<div className={style.level + ' ' + style.column}><LogLevel level={entry.level}/>
					</div>
					<div className={style.app + ' ' + style.column}>{entry.app}</div>

					<div className={style.time + ' ' + style.column}><Timestamp value={time}
														   relative/></div>
					<div className={style.message + ' ' + style.column}><LogEntry
						message={entry.message}/></div>
				</div>
			)
		});

		return (
			<div>
				<MediaQuery minWidth={750}>
					<table className={style.logs}>
						<thead>
						<tr>
							<th className={style.level}>Level</th>
							<th className={style.app}>App</th>
							<th className={style.message}>Message</th>
							<th className={style.time}>Time</th>
						</tr>
						</thead>
						<tbody>
						{rows}
						</tbody>
					</table>
				</MediaQuery>
				<MediaQuery maxWidth={750}>
					<div className={style.logs}>
						{smallRows}
					</div>
				</MediaQuery>
			</div>
		);
	}
}
