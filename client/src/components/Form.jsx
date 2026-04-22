import "./Form.css";

// Creates form for register and login
export const Form = ({
    studentId,
    setStudentId,
    email,
    setEmail,
    password,
    setPassword,
    passwordChecks, // 추가
    label,
    onSubmit
}) => {
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

                {/* 🔥 Password rules UI (only for Register) */}
                {label === "Register" && (
                    <div className="password-rules">
                        <p className="rules-title">- Password Setup Rules -</p>

                        <div className="rule-item">
                            <span className={passwordChecks.length ? "valid-icon" : "invalid-icon"}>
                                {passwordChecks.length ? "✔" : "✖"}
                            </span>
                            <span>At least 8 characters</span>
                        </div>

                        <div className="rule-item">
                            <span className={passwordChecks.letter ? "valid-icon" : "invalid-icon"}>
                                {passwordChecks.letter ? "✔" : "✖"}
                            </span>
                            <span>Contains a letter</span>
                        </div>

                        <div className="rule-item">
                            <span className={passwordChecks.number ? "valid-icon" : "invalid-icon"}>
                                {passwordChecks.number ? "✔" : "✖"}
                            </span>
                            <span>Contains a number</span>
                        </div>

                        <div className="rule-item">
                            <span className={passwordChecks.special ? "valid-icon" : "invalid-icon"}>
                                {passwordChecks.special ? "✔" : "✖"}
                            </span>
                            <span>Contains a special character</span>
                        </div>
                    </div>
                )}
            </div>
            {/* Submits the form when button is clicked */}
            <button className="form-submit" type="submit">{label}</button>
        </form>
    );
};