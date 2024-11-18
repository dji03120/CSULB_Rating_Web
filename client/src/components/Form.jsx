import "./Form.css";

// Creates form for register and login
export const Form = ({ studentId, setStudentId, email, setEmail, password, setPassword, label, onSubmit }) => {
    return (
        <form onSubmit={onSubmit}>
            {/* <h2>{label}</h2> */}
            <div className="form-group">
                <label className="form-input-label" htmlFor="studentId">CSULB Student ID </label>
                <input
                    className="form-input"
                    type="text" 
                    id="studentId" 
                    value={studentId}
                    onChange={(event) => setStudentId(event.target.value)}
                />
            </div>
            {label === "Register" && (
                <div className="form-group">
                    <label className="form-input-label" htmlFor="email">Email </label>
                    <input
                        className="form-input" 
                        type="text" 
                        id="email" 
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                    />
                </div>
            )}
            <div className="form-group">
                <label className="form-input-label" htmlFor="password">Password </label>
                <input
                    className="form-input" 
                    type="password" 
                    id="password" 
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                />
            </div>
            {/* Submits the form when button is clicked */}
            <button className="form-submit" type="submit">{label}</button>
        </form>
    );
};